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

## CI / external verification
- Production CI workflow exists at .github/workflows/ci.yml.
- Repository has no package-lock.json, so the workflow intentionally uses npm install rather than npm ci.
- The available GitHub connector currently exposes no workflow run and no commit status for the latest commits. Therefore CI PASS is not inferred.
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

### REMAINING EXTERNAL EVIDENCE
1. Run/observe the deployed browser E2E once from a browser-capable environment.
2. Observe the GitHub Actions CI run for the production commit.
3. Optionally enable Supabase Auth leaked-password protection.

### RELEASE DECISION
The OSIP V2 engineering implementation is complete and the core commercial path is runtime-verified.

**RELEASE STATUS: RELEASE CANDIDATE READY — EXTERNAL VERIFICATION PENDING.**

No additional feature development is required for the release gate. Any work after external verification should be treated as post-release hardening/optimization, not as unfinished core implementation.

## Latest verification evidence
- Latest documentation checkpoint commit: af3171cf8334e327aeb123a36fde9fd46df0d252
- CI workflow compatibility commit: 5c007d5d42a15cae2e9a6d8fe565706a0618b577
- Supabase remains ACTIVE_HEALTHY.
- SQL verification confirms exactly 20 public tables and each reports rowsecurity=true.
- Four commercial atomic RPCs remain present and privilege-regression verified.
