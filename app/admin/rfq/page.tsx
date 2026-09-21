"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type Rfq = {
  id: string;
  rfq_number: string;
  status: string;
  requested_at: string;
  customers: { company_name: string } | null;
  customer_contacts: {
    full_name: string;
    whatsapp: string;
    city: string;
    industry: string;
    email: string | null;
  } | null;
  rfq_items: Array<{
    id: string;
    qty_requested: number;
    description: string | null;
    parts: { part_number: string; description: string | null } | null;
  }>;
};

export default function InternalRfqPage() {
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [status, setStatus] = useState("Loading RFQs…");

  useEffect(() => {
    async function load() {
      const s = createBrowserClient();
      const { data: { user } } = await s.auth.getUser();

      if (!user) {
        location.href = "/login";
        return;
      }

      const { data, error } = await s
        .from("rfqs")
        .select(
          "id,rfq_number,status,requested_at,customers(company_name),customer_contacts(full_name,whatsapp,city,industry,email),rfq_items(id,qty_requested,description,parts(part_number,description))"
        )
        .order("requested_at", { ascending: false });

      if (error) {
        setStatus(error.message);
        return;
      }

      setRfqs((data ?? []) as Rfq[]);
      setStatus(data?.length ? "" : "No RFQs available for your role.");
    }

    void load();
  }, []);

  return (
    <main className="shell">
      <section className="card">
        <span className="eyebrow">INTERNAL RFQ</span>
        <h1>RFQ Workspace</h1>
        {status && <p className="muted">{status}</p>}

        <div className="stack">
          {rfqs.map((rfq) => (
            <article className="card" key={rfq.id}>
              <div className="split">
                <div>
                  <strong>{rfq.rfq_number}</strong>
                  <p className="muted">
                    {new Date(rfq.requested_at).toLocaleString()} · {rfq.status}
                  </p>
                </div>
                <strong>{rfq.customers?.company_name ?? "Customer unavailable"}</strong>
              </div>

              {rfq.customer_contacts && (
                <p className="muted">
                  PIC: {rfq.customer_contacts.full_name} · WhatsApp: {rfq.customer_contacts.whatsapp} ·{" "}
                  {rfq.customer_contacts.city} · {rfq.customer_contacts.industry}
                  {rfq.customer_contacts.email ? ` · ${rfq.customer_contacts.email}` : ""}
                </p>
              )}

              <ul>
                {rfq.rfq_items.map((item) => (
                  <li key={item.id}>
                    <strong>{item.parts?.part_number ?? "Part unavailable"}</strong>
                    {" · "}
                    Qty {item.qty_requested}
                    {item.parts?.description ? ` · ${item.parts.description}` : ""}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
