"use client";

import { FormEvent, useEffect, useState } from "react";
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
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("");
  const [waUrl, setWaUrl] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("partId");
    if (id) setPartId(id);
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("Saving RFQ securely…");
    setWaUrl("");

    const normalizedWa = normalizeWhatsApp(whatsapp);
    if (normalizedWa.length < 10 || !partId.trim() || Number(qty) <= 0) {
      setStatus("Please check WhatsApp, Part ID and quantity.");
      return;
    }

    const s = createBrowserClient();
    const { data: { user } } = await s.auth.getUser();

    let result: { rfq_number: string } | null = null;
    let errorMessage = "";

    if (user) {
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
      if (error) errorMessage = error.message;
      else result = data as { rfq_number: string };
    } else {
      try {
        const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!base) throw new Error("Public RFQ service is not configured.");
        const response = await fetch(base + "/functions/v1/osip-public-rfq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: company.trim(), name: name.trim(), whatsapp,
            city: city.trim(), industry: industry.trim(), email: email.trim(),
            partId: partId.trim(), qty: Number(qty), website,
          }),
        });
        const data = await response.json();
        if (!response.ok) errorMessage = data.error || "Unable to submit RFQ.";
        else result = data as { rfq_number: string };
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : "Unable to submit RFQ.";
      }
    }

    if (!result) {
      setStatus(errorMessage || "Unable to submit RFQ.");
      return;
    }

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
        <p className="muted">Submit your spare-parts request. We save the RFQ securely before WhatsApp handoff.</p>
        <form className="form" onSubmit={submit}>
          <label>Company<input value={company} onChange={e => setCompany(e.target.value)} required maxLength={200} /></label>
          <label>Contact name<input value={name} onChange={e => setName(e.target.value)} required maxLength={200} /></label>
          <label>WhatsApp<input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required maxLength={40} /></label>
          <label>City<input value={city} onChange={e => setCity(e.target.value)} required maxLength={100} /></label>
          <label>Industry<input value={industry} onChange={e => setIndustry(e.target.value)} required maxLength={100} /></label>
          <label>Email (optional)<input type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={200} /></label>
          <label>Part ID<input value={partId} onChange={e => setPartId(e.target.value)} required maxLength={80} /></label>
          <label>Quantity<input type="number" min="1" max="1000000" value={qty} onChange={e => setQty(e.target.value)} required /></label>
          <label style={{position:"absolute",left:"-10000px",width:"1px",height:"1px",overflow:"hidden"}} aria-hidden="true">
            Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
          </label>
          <button className="button primary">Submit RFQ</button>
        </form>
        {status && <p className="muted">{status}</p>}
        {waUrl && <a className="button" href={waUrl} target="_blank" rel="noreferrer">Continue to WhatsApp</a>}
      </section>
    </main>
  );
}
