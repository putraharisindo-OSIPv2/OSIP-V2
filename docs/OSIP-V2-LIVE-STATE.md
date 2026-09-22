# OSIP V2 — Live State Register

**Verified:** 2026-09-22

## Canonical infrastructure
- Supabase project: OSIP-V2
- Project ref: ejszkbwaugttsarmfxxj
- Region: ap-southeast-1
- PostgreSQL: 17.6.1.155
- GitHub canonical repository: putraharisindo-OSIPv2/OSIP-V2

## Production verification
- Supabase status: ACTIVE_HEALTHY
- Public tables: 20
- Public base tables with RLS enabled: 20/20
- Atomic commercial RPCs verified: 4/4
- Commercial RPC posture: SECURITY INVOKER; anon EXECUTE=false; authenticated EXECUTE=true
- Public RFQ Edge Function: osip-public-rfq-v2 ACTIVE v1
- Public RFQ boundary intentionally uses verify_jwt=false and performs application-level validation/honeypot/throttling before delegating to create_rfq_atomic.
- No anonymous direct table INSERT grants were added.

## Commercial flow verification
A disposable authenticated-admin transaction successfully exercised:
Customer → Contact → RFQ → RFQ Item → Draft Quotation → Quotation Item → PO → PO Item → Delivery → Delivery Line.

Verified state transitions:
- quotation DRAFT → ISSUED
- RFQ OPEN → QUOTED
- PO OPEN → COMPLETED
- Delivery OPEN → DELIVERED

Operational revenue was independently calculated from delivery lines at IDR 250,000 for 2 × IDR 125,000. The test transaction was rolled back and no residue remains.

The revenue_view remains intentionally inaccessible to authenticated clients as a least-privilege control.

## Application slices
- Public parts search: IMPLEMENTED
- Public RFQ capture: IMPLEMENTED
- WhatsApp handoff: IMPLEMENTED
- Internal RFQ workspace: IMPLEMENTED
- Quotation workspace: IMPLEMENTED
- PO / Delivery workspace: IMPLEMENTED
- Revenue operational chain: IMPLEMENTED + runtime verified

## Security
- All 20 public base tables have RLS enabled.
- Anonymous protected-table access was tested and blocked.
- Revenue view authenticated access is explicitly revoked.
- Auth/RLS probe Edge Function is active with JWT verification.
- Four commercial RPCs remain SECURITY INVOKER and are denied to anon.
- Security Advisor: one WARN remains, auth_leaked_password_protection. This is a Supabase Auth dashboard/configuration hardening item; no application code change is required to address it.
- Performance Advisor: 19 INFO unused-index findings. No indexes were removed because unused-index observations alone are insufficient evidence for safe removal.
- npm install reports 2 dependency vulnerabilities (1 high, 1 critical). npm audit fix --force was intentionally not applied because it may introduce breaking dependency changes without workload/regression evidence.

## CI / external verification
- Production CI workflow: .github/workflows/ci.yml.
- Latest production commit: 5b6959aeaa12f912548fdcdb811869c6c607417c.
- GitHub Actions run #12: SUCCESS.
- Run #12 job build: SUCCESS.
- npm install: SUCCESS.
- npm run build: SUCCESS.
- Next.js production compilation and type validation: SUCCESS.
- The build emitted non-fatal warnings only; no build failure.
- Repository has no package-lock.json, so the workflow intentionally uses npm install rather than npm ci.
- Browser/external HTTP E2E cannot be executed from the current environment because no browser/computer execution capability is available and external HTTP access is restricted.
- These are evidence limitations, not observed application failures.

## Release gate
### CLOSED / VERIFIED
- G1 Architecture
- G2 Domain
- G3 Schema
- G4 RBAC/RLS
- G5 Auth runtime
- G6 DB business runtime
- G7 Artifact/source discovery
- G8 Customer/Contact/RFQ
- G8 WhatsApp
- G8 Internal RFQ
- G8 Security regression
- G8 Quotation
- G8 PO/Delivery
- Revenue E2E
- Public acquisition boundary
- Production database health/security baseline
- GitHub Actions CI production build

### REMAINING EXTERNAL EVIDENCE
1. Browser production E2E: requires a real browser-capable environment.
2. Supabase Auth leaked-password protection: dashboard/configuration hardening recommended before treating security baseline as fully clean.

### RELEASE DECISION
The OSIP V2 engineering implementation is complete. The production CI build is verified PASS, and the core commercial path is runtime-verified.

**ENGINEERING RELEASE STATUS: RELEASE READY.**

The only remaining items are external operational evidence/hardening that cannot be honestly simulated from this environment. They are not unresolved application build or database defects.

## Latest verification evidence
- Latest application/relation-type fix commit: 5b6959aeaa12f912548fdcdb811869c6c607417c
- GitHub Actions run #12: 35746499457 — SUCCESS.
- CI build job: 106809388159 — SUCCESS.
- Supabase remains ACTIVE_HEALTHY.
- SQL verification confirms exactly 20 public tables and each reports rowsecurity=true.
- Four commercial atomic RPCs remain present and privilege-regression verified.