"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type Rfq = {
  id: string;
  rfq_number: string;
  status: string;
  requested_at: string;
  customer_id: string;
  customer_name: string;
  contact_name: string;
  whatsapp: string;
  city: string;
  industry: string;
  item_id: string;
  part_id: string;
  part_number: string;
  description: string | null;
  quantity: number;
};

type Quotation = { id: string; quotation_number: string };
type PurchaseOrder = { id: string; po_number: string };
type Delivery = { id: string; delivery_number: string };

export default function WorkspacePage() {
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState<Record<string, string>>({});
  const [quote, setQuote] = useState<Record<string, Quotation>>({});
  const [po, setPo] = useState<Record<string, PurchaseOrder>>({});
  const [delivery, setDelivery] = useState<Record<string, Delivery>>({});

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

    if (!["admin", "sales", "procurement"].includes(roleName)) {
      setMessage("This workspace is restricted to authorized commercial roles.");
      return;
    }

    const { data, error } = await s
      .from("rfqs")
      .select(
        "id,rfq_number,status,requested_at,customer_id,customers(company_name),customer_contacts(full_name,whatsapp,city,industry),rfq_items(id,part_id,description,qty_requested,parts(part_number))"
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
        customer_id: r.customer_id,
        customer_name: customer?.company_name || "Unknown customer",
        contact_name: contact?.full_name || "-",
        whatsapp: contact?.whatsapp || "-",
        city: contact?.city || "-",
        industry: contact?.industry || "-",
        item_id: item.id,
        part_id: item.part_id,
        part_number: item.parts?.part_number || "-",
        description: item.description,
        quantity: Number(item.qty_requested),
      }));
    });

    setRfqs(rows);
  }

  useEffect(() => { load(); }, []);

  async function createQuotation(r: Rfq) {
    const unitPrice = Number(price[r.item_id]);
    if (!unitPrice || unitPrice <= 0) {
      setMessage("Enter a positive selling price first.");
      return;
    }
    setBusy(r.item_id);
    setMessage("");
    const s = createBrowserClient();
    const { data, error } = await s.rpc("create_draft_quotation_atomic", {
      p_rfq_id: r.id,
      p_items: [{ rfq_item_id: r.item_id, unit_price: unitPrice }],
    });
    setBusy("");
    if (error) {
      setMessage(error.message);
      return;
    }
    setQuote(q => ({ ...q, [r.item_id]: data }));
    setMessage(`Quotation ${data.quotation_number} created.`);
  }

  async function createPo(r: Rfq) {
    const q = quote[r.item_id];
    if (!q) return;
    setBusy(r.item_id);
    setMessage("");
    const s = createBrowserClient();
    const { data, error } = await s.rpc("create_po_from_quotation_atomic", {
      p_quotation_id: q.id,
    });
    setBusy("");
    if (error) {
      setMessage(error.message);
      return;
    }
    setPo(p => ({ ...p, [r.item_id]: data }));
    setMessage(`PO ${data.po_number} created.`);
    await load();
  }

  async function createDelivery(r: Rfq) {
    const p = po[r.item_id];
    if (!p) return;
    setBusy(r.item_id);
    setMessage("");
    const s = createBrowserClient();
    const { data, error } = await s.rpc("create_delivery_from_po_atomic", {
      p_po_id: p.id,
    });
    setBusy("");
    if (error) {
      setMessage(error.message);
      return;
    }
    setDelivery(d => ({ ...d, [r.item_id]: data }));
    setMessage(`Delivery ${data.delivery_number} completed.`);
    await load();
  }

  if (!["admin", "sales", "procurement"].includes(role) && !message) {
    return <main className="shell"><section className="card"><p>Loading workspace…</p></section></main>;
  }

  return (
    <main className="shell">
      <section className="card">
        <div className="split">
          <div>
            <span className="eyebrow">INTERNAL COMMERCIAL WORKSPACE</span>
            <h1>RFQ → Quotation → PO → Delivery</h1>
            <p className="muted">Role: {role || "authorized user"}. Internal workflow only.</p>
          </div>
          <button className="button" onClick={load}>Refresh</button>
        </div>

        {message && <p className="muted">{message}</p>}

        <div className="parts">
          {rfqs.map(r => {
            const q = quote[r.item_id];
            const p = po[r.item_id];
            const d = delivery[r.item_id];
            return (
              <article className="part" key={r.item_id}>
                <div className="split">
                  <div>
                    <strong>{r.rfq_number}</strong>
                    <span>{r.customer_name} · {r.contact_name} · {r.city}</span>
                    <span>{r.part_number} — {r.description || "No description"} · Qty {r.quantity}</span>
                    <span>Status: {r.status}</span>
                  </div>
                </div>

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

                {q && <span>Quotation: <strong>{q.quotation_number}</strong></span>}

                {q && !p && (
                  <button className="button primary" disabled={busy === r.item_id} onClick={() => createPo(r)}>
                    Create PO
                  </button>
                )}

                {p && <span>PO: <strong>{p.po_number}</strong></span>}

                {p && !d && (
                  <button className="button primary" disabled={busy === r.item_id} onClick={() => createDelivery(r)}>
                    Complete Delivery
                  </button>
                )}

                {d && <span>Delivery: <strong>{d.delivery_number}</strong> — DELIVERED</span>}
              </article>
            );
          })}

          {!rfqs.length && <p className="muted">No RFQs visible to this role.</p>}
        </div>
      </section>
    </main>
  );
}
