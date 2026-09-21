"use client";
import {FormEvent,useState} from "react";
import {createBrowserClient} from "@/lib/supabase/client";
export default function LoginPage(){
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");const {error}=await createBrowserClient().auth.signInWithPassword({email,password});if(error){setError(error.message);setBusy(false);return;}window.location.href="/parts";}
 return <main className="shell narrow"><section className="card"><span className="eyebrow">OSIP V2</span><h1>Sign in</h1><p className="muted">Use your authorized OSIP V2 account.</p><form onSubmit={submit} className="form"><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error&&<p className="error">{error}</p>}<button className="button primary" disabled={busy}>{busy?"Signing in…":"Sign in"}</button></form></section></main>;
}