"use client";

import { useEffect,useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type Quotation={id:string;quotation_number:string;rfq_id:string;status:string;currency:string;quotation_items:Array<{id:string;quantity:number;unit_price:number;description:string|null;parts:{part_number:string}|null}>};
type Po={id:string;po_number:string;status:string;purchase_orders?:never};

export default function FulfillmentPage(){
 const [quotations,setQuotations]=useState<Quotation[]>([]);
 const [pos,setPos]=useState<Po[]>([]);
 const [status,setStatus]=useState("Loading commercial queue…");
 async function load(){
  const s=createBrowserClient(); const {data:{user}}=await s.auth.getUser(); if(!user){location.href="/login";return;}
  const [q,p]=await Promise.all([
   s.from("quotations").select("id,quotation_number,rfq_id,status,currency,quotation_items(id,quantity,unit_price,description,parts(part_number))").eq("status","DRAFT").order("created_at",{ascending:false}),
   s.from("purchase_orders").select("id,po_number,status").eq("status","OPEN").order("ordered_at",{ascending:false})
  ]);
  if(q.error||p.error){setStatus(q.error?.message||p.error?.message||"Load failed");return}
  setQuotations((q.data??[]) as Quotation[]); setPos((p.data??[]) as Po[]); setStatus("");
 }
 useEffect(()=>{void load()},[]);
 async function createPo(id:string){
  const s=createBrowserClient();setStatus("Creating PO atomically…");
  const {data,error}=await s.rpc("create_po_from_quotation_atomic",{p_quotation_id:id});
  if(error){setStatus(error.message);return}
  setStatus(`PO ${(data as {po_number:string}).po_number} created.`); await load();
 }
 async function deliver(id:string){
  const s=createBrowserClient();setStatus("Creating delivery atomically…");
  const {data,error}=await s.rpc("create_delivery_from_po_atomic",{p_po_id:id});
  if(error){setStatus(error.message);return}
  setStatus(`Delivery ${(data as {delivery_number:string}).delivery_number} completed.`); await load();
 }
 return <main className="shell"><section className="card"><span className="eyebrow">FULFILLMENT</span><h1>PO & Delivery Workspace</h1>{status&&<p className="muted">{status}</p>}
 <div className="stack"><h2>Draft quotations</h2>{quotations.length===0?<p className="muted">No draft quotations.</p>:quotations.map(q=><article className="card" key={q.id}><strong>{q.quotation_number}</strong>{q.quotation_items.map(i=><p key={i.id}>{i.parts?.part_number??"Part"} · Qty {i.quantity} · IDR {Number(i.unit_price).toLocaleString("id-ID")}</p>)}<button className="button primary" onClick={()=>createPo(q.id)}>Create PO</button></article>)}</div>
 <div className="stack"><h2>Open purchase orders</h2>{pos.length===0?<p className="muted">No open POs.</p>:pos.map(po=><article className="card" key={po.id}><strong>{po.po_number}</strong><button className="button" onClick={()=>deliver(po.id)}>Complete Delivery</button></article>)}</div>
 </section></main>
}