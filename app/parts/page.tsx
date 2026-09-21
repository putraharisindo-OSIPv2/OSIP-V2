import {createServerClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
export default async function PartsPage(){
 const supabase=await createServerClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/login");
 const {data:parts,error}=await supabase.from("parts").select("id,part_number,description,brand_id").order("part_number").limit(50);
 return <main className="shell"><section className="card"><span className="eyebrow">PARTS INTELLIGENCE</span><h1>Parts</h1><p className="muted">{user.email}</p>{error&&<p className="error">{error.message}</p>}<div className="parts">{parts?.map(p=><article className="part" key={p.id}><strong>{p.part_number}</strong><span>{p.description||"No description"}</span></article>)}</div></section></main>;
}