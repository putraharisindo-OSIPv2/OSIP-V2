"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type Rfq = {
  id: string;
  rfq_number: string;
  status: string;
  requested_at: string;
  customer_name: string;
  contact_name: string;
  whatsapp: string;
  city: string;
  industry: string;
  item_id: string;
  part_number: string;
  description: string | null;
  quantity: number;
};

type Quote = { id: string; quotation_number: string; status: string };
type SalesOrder = {
  id: string;
  sales_order_number: string | null;
  customer_po_number: string | null;
  status: string;
};
type Delivery = { id: string; delivery_number: string; status: string };

export default function WorkspacePage() {
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [salesOrders, setSalesOrders] = useState<Record<string, SalesOrder>>({});
  const [deliveries, setDeliveries] = useState<Record<string, Delivery>>({});
  const [price, setPrice] = useState<Record<string, string>>({});
  const [customerPo, setCustomerPo] = useState<Record<string, string>>({});
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const s = createBrowserClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: me } = await s
      .from("users")
      .select("full_name, roles(name)")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const roleName = (me as any)?.roles?.name || "";
    setRole(roleName);

    if (!["admin", "sales"].includes(roleName)) {
      setMessage("This sales workspace is restricted to admin and sales roles.");
      return;
    }

    const { data, error } = await s
      .from("rfqs")
      .select(
        "id,rfq_number,status,requested_at,customers(company_name),customer_contacts(full_name,whatsapp,city,industry),rfq_items(id,part_id,description,qty_requested,parts(part_number))"
      )
      .order("requested_at", { ascending: false })
      .limit(50);

    if (error) {
      setMessage(error.message);
      return;
    }

    const rows: Rfq[] = (data || []).flatMap((r: any) => {
      const contact = Array.isArray(r.customer_contacts) ? r.customer_contacts[0] : r.customer_contacts;
      const customer = Array.isArray(r.customers) ? r.customers[0] : r.customers;
      const items = Array.isArray(r.rfq_items) ? r.rfq_items : [];
      return items.map((item: any) => ({
        id: r.id,
        rfq_number: r.rfq_number,
        status: r.status,
        requested_at: r.requested_at,
        customer_name: customer?.company_name || "Unknown customer",
        contact_name: contact?.full_name || "-",
        whatsapp: contact?.whatsapp || "-",
        city: contact?.city || "-",
        industry: contact?.industry || "-",
        item_id: item.id,
        part_number: item.parts?.part_number || "-",
        description: item.description,
        quantity: Number(item.qty_requested),
      }));
    });
    setRfqs(rows);

    const rfqIds = rows.map(r => r.id);
    if (!rfqIds.length) return;

    const { data: qData } = await s
      .from("quotations")
      .select("id,rfq_id,quotation_number,status")
      .in("rfq_id", rfqIds)
      .order("created_at", { ascending: false });

    const qMap: Record<string, Quote> = {};
    (qData || []).forEach((q: any) => {
      if (!qMap[q.rfq_id]) qMap[q.rfq_id] = q;
    });

    const { data: soData } = await s
      .from("purchase_orders")
      .select("id,quotation_id,rfq_id,po_number,sales_order_number,customer_po_number,status")
      .in("customer_id", Array.from(new Set(rows.map(r => r.customer_id).filter(Boolean))));

    const qById: Record<string, string> = {};
    (qData || []).forEach((q: any) => { qById[q.id] = q.rfq_id; });

    const soMap: Record<string, SalesOrder> = {};
    (soData || []).forEach((p: any) => {
      const rfqId = p.rfq_id || qById[p.quotation_id];
      if (rfqId && !soMap[rfqId]) {
        soMap[rfqId] = {
          id: p.id,
          sales_order_number: p.sales_order_number || p.po_number,
          customer_po_number: p.customer_po_number,
          status: p.status,
        };
      }
    });

    const soIds = Object.values(soMap).map(x => x.id);
    const { data: dData } = soIds.length
      ? await s.from("deliveries").select("id,purchase_order_id,delivery_number,status").in("purchase_order_id", soIds)
      : { data: [] as any[] };

    const dMap: Record<string, Delivery> = {};
    (dData || []).forEach((d: any) => {
      const rfqId = Object.entries(soMap).find(([, so]) => so.id === d.purchase_order_id)?.[0];
      if (rfqId) dMap[rfqId] = d;
    });

    setQuotes(qMap);
    setSalesOrders(soMap);
    setDeliveries(dMap);
  }

  useEffect(() => { load(); }, []);

  async function createQuotation(r: Rfq) {
    const unitPrice = Number(price[r.item_id]);
    if (!unitPrice || unitPrice <= 0) {
      setMessage("Masukkan selling price yang valid terlebih dahulu.");
      return;
    }
    setBusy(r.item_id);
    setMessage("");
    const s = createBrowserClient();
    const { data, error } = await s.rpc("create_draft_quotation_atomic", {
      p_rfq_id: r.id,
      p_items: [{ rfq_item_id: r.item_id, unit_price: unitPrice }],
    });
    if (error) {
      setBusy("");
      setMessage(error.message);
      return;
    }
    setBusy("");
    setMessage(`Quotation ${data.quotation_number} dibuat sebagai DRAFT. Setelah dikirim ke customer, tunggu Customer PO.`);
    await load();
  }

  async function createSalesOrder(r: Rfq) {
    const q = quotes[r.id];
    const poNumber = customerPo[r.id]?.trim();
    if (!q) {
      setMessage("Quotation belum tersedia.");
      return;
    }
    if (!poNumber) {
      setMessage("Masukkan nomor PO customer terlebih dahulu.");
      return;
    }
    setBusy(r.id);
    setMessage("");
    const s = createBrowserClient();
    const { data, error } = await s.rpc("create_po_from_quotation_atomic", {
      p_quotation_id: q.id,
      p_customer_po_number: poNumber,
    });
    if (error) {
      setBusy("");
      setMessage(error.message);
      return;
    }
    setBusy("");
    setMessage(`Customer PO ${data.customer_po_number} dicatat. Sales Order ${data.sales_order_number} dibuat.`);
    await load();
  }

  async function createDelivery(r: Rfq) {
    const so = salesOrders[r.id];
    if (!so) return;
    setBusy(r.id);
    setMessage("");
    const s = createBrowserClient();
    const { data, error } = await s.rpc("create_delivery_from_po_atomic", {
      p_po_id: so.id,
    });
    if (error) {
      setBusy("");
      setMessage(error.message);
      return;
    }
    setBusy("");
    setMessage(`Delivery ${data.delivery_number} selesai.`);
    await load();
  }

  if (!["admin", "sales"].includes(role) && !message) {
    return <main className="shell"><section className="card"><p>Loading workspace…</p></section></main>;
  }

  return (
    <main className="shell">
      <section className="card">
        <div className="split">
          <div>
            <span className="eyebrow">INTERNAL SALES WORKSPACE</span>
            <h1>RFQ → Quotation → Customer PO → Sales Order → Delivery</h1>
            <p className="muted">Role: {role || "authorized user"}. Sales workflow only.</p>
          </div>
          <button className="button" onClick={load}>Refresh</button>
        </div>

        {message && <p className="muted">{message}</p>}

        <div className="parts">
          {rfqs.map(r => {
            const q = quotes[r.id];
            const so = salesOrders[r.id];
            const d = deliveries[r.id];
            const legacy = so && !so.customer_po_number;

            return (
              <article className="part" key={r.item_id}>
                <strong>{r.rfq_number}</strong>
                <span>{r.customer_name} · {r.contact_name} · {r.city}</span>
                <span>{r.part_number} — {r.description || "No description"} · Qty {r.quantity}</span>
                <span>Status RFQ: {r.status}</span>

                {r.status === "OPEN" && !q && (
                  <div className="actions">
                    <input
                      aria-label={`Selling price for ${r.part_number}`}
                      type="number"
                      min="1"
                      placeholder="Selling price (IDR)"
                      value={price[r.item_id] || ""}
                      onChange={e => setPrice(v => ({ ...v, [r.item_id]: e.target.value }))}
                    />
                    <button className="button primary" disabled={busy === r.item_id} onClick={() => createQuotation(r)}>
                      {busy === r.item_id ? "Working…" : "Create Quotation"}
                    </button>
                  </div>
                )}

                {q && (
                  <>
                    <span>Quotation: <strong>{q.quotation_number}</strong> — {q.status}</span>
                    {q.status === "DRAFT" && (
                      <span className="muted">Quotation draft dibuat. Tahap berikutnya: kirim quotation ke customer dan tunggu Customer PO.</span>
                    )}
                  </>
                )}

                {q?.status === "ISSUED" && !so && (
                  <div className="actions">
                    <input
                      aria-label={`Customer PO number for ${r.rfq_number}`}
                      type="text"
                      placeholder="Nomor PO Customer"
                      value={customerPo[r.id] || ""}
                      onChange={e => setCustomerPo(v => ({ ...v, [r.id]: e.target.value }))}
                    />
                    <button className="button primary" disabled={busy === r.id} onClick={() => createSalesOrder(r)}>
                      {busy === r.id ? "Working…" : "Record Customer PO → Create Sales Order"}
                    </button>
                  </div>
                )}

                {so && (
                  <>
                    <span>Customer PO: <strong>{so.customer_po_number || "LEGACY TEST — no customer PO recorded"}</strong></span>
                    <span>Sales Order: <strong>{so.sales_order_number}</strong> — {so.status}</span>
                    {legacy && <span className="muted">This record belongs to the previous technical workflow test. It is not evidence of a real customer PO.</span>}
                  </>
                )}

                {so && !legacy && !d && (
                  <button className="button primary" disabled={busy === r.id} onClick={() => createDelivery(r)}>
                    {busy === r.id ? "Working…" : "Create / Complete Delivery"}
                  </button>
                )}

                {d && <span>Delivery: <strong>{d.delivery_number}</strong> — {d.status}</span>}
              </article>
            );
          })}

          {!rfqs.length && <p className="muted">No RFQs visible to this role.</p>}
        </div>
      </section>
    </main>
  );
}
