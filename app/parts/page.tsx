"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
type Part={id:string;part_number:string;description:string|null;brand_id:string};
export default function PartsPage(){
 const [q,setQ]=useState(""); const [parts,setParts]=useState<Part[]>([]); const [error,setError]=useState("");
 useEffect(()=>{let active=true;(async()=>{const s=createBrowserClient();const {data:{user}}=await s.auth.getUser();if(!user){window.location.href="/login";return;}let query=s.from("parts").select("id,part_number,description,brand_id").order("part_number").limit(50);if(q.trim()) query=query.ilike("part_number",q.trim()+"%");const {data,error}=await query;if(active){setParts(data||[]);setError(error?.message||"");}})();return()=>{active=false}},[q]);
 return <main className="shell"><section className="card"><span className="eyebrow">PARTS INTELLIGENCE</span><h1>Parts Search</h1><input aria-label="Part number" placeholder="Search exact or prefix part number" value={q} onChange={e=>setQ(e.target.value)}/>{error&&<p className="error">{error}</p>}<div className="parts">{parts.map(p=><article className="part" key={p.id}><strong>{p.part_number}</strong><span>{p.description||"No description"}</span><Link className="button" href={`/rfq?partId=${encodeURIComponent(p.id)}`}>Request Quote</Link></article>)}</div></section></main>;
}