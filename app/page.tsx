import Link from "next/link";
export default function HomePage() {
  return <main className="shell"><section className="hero"><span className="eyebrow">OSIP V2</span><h1>Industrial Intelligence & Procurement</h1><p>Intelligence → Demand → RFQ → Quotation → PO → Delivery → Revenue</p><div className="actions"><Link className="button primary" href="/login">Sign in</Link><Link className="button" href="/parts">Parts Intelligence</Link></div></section></main>;
}