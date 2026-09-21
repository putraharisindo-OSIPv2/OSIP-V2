"use client";
import {useState} from "react";
import {createBrowserClient} from "@/lib/supabase/client";
export default function RfqPage(){
 const [company,setCompany]=useState("");const [partId,setPartId]=useState("");const [qty,setQty]=useState("1");const [status,setStatus]=useState("");
 async function submit(e:React.FormEvent){e.preventDefault();setStatus("Saving RFQ…");const s=createBrowserClient();const {data:{user}}=await s.auth.getUser();if(!user){location.href="/login";return;}
 const customer=await s.from("customers").insert({company_name:company}).select("id").single();if(customer.error){setStatus(customer.error.message);return;}
 const rfq=await s.from("rfqs").insert({customer_id:customer.data.id,status:"submitted",requested_at:new Date().toISOString()}).select("id,rfq_number").single();if(rfq.error){setStatus(rfq.error.message);return;}
 const item=await s.from("rfq_items").insert({rfq_id:rfq.data.id,part_id:partId,qty_requested:Number(qty)});if(item.error){setStatus(item.error.message);return;}
 setStatus("RFQ "+rfq.data.rfq_number+" saved successfully.");}
 return <main className="shell narrow"><section className="card"><span className="eyebrow">RFQ</span><h1>Request a Quote</h1><form className="form" onSubmit={submit}><label>Company<input value={company} onChange={e=>setCompany(e.target.value)} required/></label><label>Part ID<input value={partId} onChange={e=>setPartId(e.target.value)} required/></label><label>Quantity<input type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} required/></label><button className="button primary">Submit RFQ</button></form>{status&&<p className="muted">{status}</p>}</section></main>;
}