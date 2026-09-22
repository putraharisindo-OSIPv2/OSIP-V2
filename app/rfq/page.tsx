"use client";

import { FormEvent, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

function normalizeWhatsApp(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  return digits;
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
    setStatus("Saving RFQ securely…");
    setWaUrl("");

    const s = createBrowserClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) {
      location.href = "/login";
      return;
    }

    const normalizedWa = normalizeWhatsApp(whatsapp);
    if (normalizedWa.length < 10 || !partId.trim() || Number(qty) <= 0) {
      setStatus("Please check WhatsApp, Part ID and quantity.");
      return;
    }

    const { data, error } = await s.rpc("create_rfq_atomic", {
      p_company_name: company.trim(),
      p_full_name: name.trim(),
      p_whatsapp: normalizedWa,
      p_city: city.trim(),
      p_industry: industry.trim(),
      p_email: email.trim() || null,
      p_part_id: partId.trim(),
      p_quantity: Number(qty),
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    const result = data as { rfq_number: string };
    const waMessage = [
      `RFQ ${result.rfq_number}`,
      `Perusahaan: ${company.trim()}`,
      `PIC: ${name.trim()}`,
      `WhatsApp: ${whatsapp.trim()}`,
      `Kota: ${city.trim()}`,
      `Industri: ${industry.trim()}`,
      `Part ID: ${partId.trim()}`,
      `Qty: ${qty}`,
    ].join("\n");

    setWaUrl(`https://wa.me/${normalizedWa}?text=${encodeURIComponent(waMessage)}`);
    setStatus(`RFQ ${result.rfq_number} saved successfully.`);
  }

  return (
    <main className="shell narrow">
      <section className="card">
        <span className="eyebrow">RFQ</span>
        <h1>Request a Quote</h1>
        <p className="muted">Your RFQ is saved atomically before WhatsApp handoff.</p>
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
        {waUrl && <a className="button" href={waUrl} target="_blank" rel="noreferrer">Continue to WhatsApp</a>}
      </section>
    </main>
  );
}
