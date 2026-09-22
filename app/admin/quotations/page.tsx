"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type Rfq = {
  id: string; rfq_number: string; customer_id: string;
  customers: { company_name: string } | null;
  rfq_items: Array<{ id: string; part_id: string; qty_requested: number; description: string | null; parts: { part_number: string; description: string | null } | null; }>;
};

export default function QuotationsPage() {
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [selected, setSelected] = useState<Rfq | null>(null);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("Loading open RFQs…");

  useEffect(() => {
    async function load() {
      const s = createBrowserClient();
      const { data: { user } } = await s.auth.getUser();
      if (!user) { location.href = "/login"; return; }
      const { data, error } = await s.from("rfqs")
        .select("id,rfq_number,customer_id,customers(company_name),rfq_items(id,part_id,qty_requested,description,parts(part_number,description))")
        .eq("status", "OPEN").order("requested_at", { ascending: false });
      if (error) { setStatus(error.message); return; }
      setRfqs((data ?? []) as Rfq[]);
      setStatus(data?.length ? "" : "No open RFQs.");
    }
    void load();
  }, []);

  async function createQuotation() {
    if (!selected) return;
    setStatus("Creating quotation atomically…");
    const s = createBrowserClient();
    const rows = selected.rfq_items.map(item => ({
      rfq_item_id: item.id,
      unit_price: Number(prices[item.id] ?? 0)
    }));
    if (rows.some(row => !Number.isFinite(row.unit_price) || row.unit_price <= 0)) {
      setStatus("Every RFQ item needs a positive unit price.");
      return;
    }
    const { data, error } = await s.rpc("create_draft_quotation_atomic", {
      p_rfq_id: selected.id,
      p_items: rows
    });
    if (error) { setStatus(error.message); return; }
    const result = data as { quotation_number: string };
    setStatus(`Quotation ${result.quotation_number} created.`);
    setSelected(null);
    setPrices({});
  }

  return (
    <main className="shell">
      <section className="card">
        <span className="eyebrow">COMMERCIAL</span>
        <h1>Quotation Workspace</h1>
        {status && <p className="muted">{status}</p>}
        <div className="stack">
          {rfqs.map(rfq => (
            <article className="card" key={rfq.id}>
              <div className="split">
                <div><strong>{rfq.rfq_number}</strong><p className="muted">{rfq.customers?.company_name ?? "Customer unavailable"}</p></div>
                <button className="button" onClick={() => setSelected(rfq)}>Prepare quotation</button>
              </div>
              {rfq.rfq_items.map(item => (
                <p key={item.id}>
                  <strong>{item.parts?.part_number ?? "Part"}</strong> · Qty {item.qty_requested}
                  {selected?.id === rfq.id && (
                    <input aria-label={`Unit price for ${item.parts?.part_number ?? item.id}`} type="number" min="1" placeholder="Unit price IDR"
                      value={prices[item.id] ?? ""} onChange={e => setPrices({...prices, [item.id]: e.target.value})}/>
                  )}
                </p>
              ))}
              {selected?.id === rfq.id && <button className="button primary" onClick={createQuotation}>Create Draft Quotation</button>}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
