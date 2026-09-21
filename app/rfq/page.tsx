"use client";

import { FormEvent, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

function normalizeWhatsApp(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  return digits;
}

function buildRfqNumber() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `RFQ-${stamp}-${suffix}`;
}

export default function RfqPage() {
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [email, setEmail] = useState("");
  const [partId, setPartId] = useState("");
  const [qty, setQty] = useState("1");
  const [status, setStatus] = useState("");
  const [waUrl, setWaUrl] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("Saving RFQ…");
    setWaUrl("");

    const s = createBrowserClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) {
      location.href = "/login";
      return;
    }

    const customer = await s
      .from("customers")
      .insert({ company_name: company.trim() })
      .select("id")
      .single();

    if (customer.error) {
      setStatus(customer.error.message);
      return;
    }

    const normalizedWa = normalizeWhatsApp(whatsapp);
    const contact = await s
      .from("customer_contacts")
      .insert({
        customer_id: customer.data.id,
        full_name: name.trim(),
        whatsapp: normalizedWa,
        city: city.trim(),
        industry: industry.trim(),
        email: email.trim() || null,
      })
      .select("id")
      .single();

    if (contact.error) {
      setStatus(contact.error.message);
      return;
    }

    const rfq = await s
      .from("rfqs")
      .insert({
        customer_id: customer.data.id,
        contact_id: contact.data.id,
        rfq_number: buildRfqNumber(),
        status: "OPEN",
        requested_at: new Date().toISOString(),
      })
      .select("id,rfq_number")
      .single();

    if (rfq.error) {
      setStatus(rfq.error.message);
      return;
    }

    const item = await s
      .from("rfq_items")
      .insert({
        rfq_id: rfq.data.id,
        part_id: partId.trim(),
        qty_requested: Number(qty),
      });

    if (item.error) {
      setStatus(item.error.message);
      return;
    }

    const waMessage = [
      `RFQ ${rfq.data.rfq_number}`,
      `Perusahaan: ${company.trim()}`,
      `PIC: ${name.trim()}`,
      `WhatsApp: ${whatsapp.trim()}`,
      `Kota: ${city.trim()}`,
      `Industri: ${industry.trim()}`,
      `Part ID: ${partId.trim()}`,
      `Qty: ${qty}`,
    ].join("\n");

    setWaUrl(`https://wa.me/${normalizedWa}?text=${encodeURIComponent(waMessage)}`);
    setStatus(`RFQ ${rfq.data.rfq_number} saved successfully.`);
  }

  return (
    <main className="shell narrow">
      <section className="card">
        <span className="eyebrow">RFQ</span>
        <h1>Request a Quote</h1>
        <form className="form" onSubmit={submit}>
          <label>Company<input value={company} onChange={e => setCompany(e.target.value)} required /></label>
          <label>Contact name<input value={name} onChange={e => setName(e.target.value)} required /></label>
          <label>WhatsApp<input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required /></label>
          <label>City<input value={city} onChange={e => setCity(e.target.value)} required /></label>
          <label>Industry<input value={industry} onChange={e => setIndustry(e.target.value)} required /></label>
          <label>Email (optional)<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label>Part ID<input value={partId} onChange={e => setPartId(e.target.value)} required /></label>
          <label>Quantity<input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} required /></label>
          <button className="button primary">Submit RFQ</button>
        </form>
        {status && <p className="muted">{status}</p>}
        {waUrl && (
          <a className="button" href={waUrl} target="_blank" rel="noreferrer">
            Continue to WhatsApp
          </a>
        )}
      </section>
    </main>
  );
}
