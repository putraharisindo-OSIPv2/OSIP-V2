# OSIP V2 — Live State Register

**Verified:** 2026-09-22

## Canonical infrastructure
- Supabase project: OSIP-V2
- Project ref: ejszkbwaugttsarmfxxj
- Region: ap-southeast-1
- PostgreSQL: 17.6.1.155
- GitHub canonical repository: putraharisindo-OSIPv2/OSIP-V2

## Live migrations
1. 20260915173209 osip_v2_cto_hardened_domain_001
2. 20260915234925 osip_v2_security_definer_lockdown_001
3. 20260915234932 osip_v2_fk_indexes_001
4. 20260916132213 osip_v2_public_api_least_privilege_001
5. 20260916132535 osip_v2_auth_identity_bridge_001
6. 20260916132607 osip_v2_rls_policy_helpers_001
7. 20260916134432 osip_v2_service_role_runtime_grants_001
8. 20260916161557 osip_v2_rbac_roles_seed_001
9. 20260916161612 osip_v2_rbac_permissions_seed_001
10. 20260916161919 osip_v2_rbac_rls_policies_001
11. 20260917063251 osip_v2_rls_policies_001
12. 20260917063340 osip_v2_rls_policy_dedup_001
13. 20260918042459 osip_v2_fix_current_role_execute_001
14. 20260921203637 osip_v2_customer_contacts_001
15. 20260921203716 osip_v2_rfq_contact_link_001
16. 20260922030415 osip_v2_atomic_commercial_transactions_001
17. osip_v2_po_delivery_atomic_transactions_001

## Security verification
- RLS enabled on all 20 public base tables.
- 80 CRUD policies exist for authenticated access.
- Policies use private.osip_can().
- Anonymous protected-table access was tested and blocked.
- Revenue view authenticated access was explicitly revoked.
- Auth/RLS probe Edge Function is active with JWT verification.
- Atomic commercial RPCs are SECURITY INVOKER; anon EXECUTE is false and authenticated EXECUTE is true.

## Current advisors
Security: one warning remains — leaked-password protection is disabled in Supabase Auth.
Performance: 21 unused-index INFO findings. These are advisory only and remain untouched pending workload/query-plan evidence.

## G8 acceleration evidence — 2026-09-22

### A8 Security regression
Verified for affected commercial tables.

### A9 Quotation slice
The quotation workspace uses the atomic quotation RPC.

### Commercial chain acceleration
Two new SECURITY INVOKER RPCs now provide atomic:
- Draft Quotation → Purchase Order
- Purchase Order → Delivery

Both are denied to anon and executable by authenticated roles subject to table RLS/RBAC.

A disposable authenticated admin transaction successfully exercised:
Customer → Contact → RFQ → RFQ Item → Draft Quotation → Quotation Item → PO → PO Item → Delivery → Delivery Line.

Verified state transitions:
- quotation DRAFT → ISSUED
- RFQ OPEN → QUOTED
- PO OPEN → COMPLETED
- Delivery OPEN → DELIVERED

The complete test was rolled back and left no residue.

A new internal UI was added at app/admin/fulfillment/page.tsx.
- Draft quotations can be converted to PO.
- Open POs can be completed through Delivery.

The RFQ UI uses the atomic RFQ RPC. Parts search links a selected part directly into the RFQ flow.

## G8 public acquisition acceleration — 2026-09-22

A controlled public RFQ boundary is now ACTIVE as Supabase Edge Function `osip-public-rfq-v2` (JWT verification intentionally disabled because the function is the public unauthenticated boundary). It performs strict input validation, honeypot filtering, in-memory per-IP throttling, and delegates persistence to the existing atomic `create_rfq_atomic` RPC. No anonymous direct table write access was added.

The RFQ page now supports both authenticated atomic RPC submission and unauthenticated public lead capture, followed by WhatsApp handoff.

## Revenue E2E verification — 2026-09-22

A disposable authenticated-admin transaction exercised RFQ → Quotation → PO → Delivery and calculated operational revenue directly from delivery lines at IDR 250,000 for 2 × IDR 125,000. Quotation/PO/Delivery state transitions passed and the transaction was rolled back. No test residue remains. The `revenue_view` remains intentionally inaccessible to authenticated clients as a least-privilege internal view.

## Current gate state
- G8 A5 Customer/Contact/RFQ: IMPLEMENTED
- G8 A6 WhatsApp: IMPLEMENTED
- G8 A7 Internal RFQ Workspace: IMPLEMENTED
- G8 A8 Security Regression: VERIFIED
- G8 A9 Quotation Slice: IMPLEMENTED + atomic runtime test PASS
- G8 A10 PO/Delivery Slice: IMPLEMENTED + atomic runtime test PASS
- G9 E2E QA: PENDING — database/runtime E2E is substantially covered; browser E2E evidence remains pending
- G10 Production Hardening: IN PROGRESS
- G11 RELEASE: PENDING

## Release blockers
1. Browser/runtime E2E evidence is still pending for the deployed Next.js UI.
2. Supabase Auth leaked-password protection warning remains.
3. Final production deployment/build verification remains pending.
4. Public edge-function throttling is intentionally lightweight/in-memory; stronger provider-level rate limiting/CAPTCHA can be added before high-volume acquisition.
5. The public RFQ edge function is active and delegates to the atomic RFQ RPC; no anonymous table INSERT grants were added.

The recovered legacy OSCARPART/SANY source remains reference material until adapted to the V2 contract.

## Latest acceleration evidence — 2026-09-22
- Public RFQ Edge Function: `osip-public-rfq-v2`, ACTIVE v1, JWT verification disabled by design for the public boundary.
- Public RFQ frontend commit: `b21928748052cac3ed7b9fc2d74bf117ea2012a4`.
- CI build workflow commit: `c6b4edd3e218ca06e4080720b9a9a772b7a9a772b7a9a772`.
- Live-state documentation commit: `42dc314acb8768fd90fce4c7569c182ce07637a5`.
- Supabase verification confirms all four commercial RPCs are SECURITY INVOKER, denied to anon, and executable by authenticated users.
- External HTTP/browser verification could not be completed from the current execution environment; therefore G9/G11 are not falsely marked closed.


## Final hardening checkpoint — 2026-09-22
- Security Advisor rechecked after latest changes: only one external WARN remains, `auth_leaked_password_protection` (Supabase Auth setting). No new RLS/security finding was introduced.
- Commercial RPC privilege regression rechecked: all four atomic commercial RPCs remain SECURITY INVOKER; anon EXECUTE=false; authenticated EXECUTE=true.
- Public RFQ function `osip-public-rfq-v2` is ACTIVE and its deployed source delegates persistence to `create_rfq_atomic`.
- CI workflow source is present at `.github/workflows/ci.yml`; repository has no `package-lock.json`, so the workflow intentionally uses `npm install` rather than `npm ci`.
- GitHub workflow status is not yet observable for the current commits from the available connector, so build PASS is not claimed.
- Browser/external HTTP E2E is not observable in the current execution environment, so RELEASE remains gated on that evidence plus the remaining Auth hardening action.


## Release-gate verification refresh — 2026-09-22 17:03 WIB
- Rechecked commit `5c007d5d42a15cae2e9a6d8fe565706a0618b577`: GitHub connector exposes no workflow run and no commit status for this commit, so CI PASS remains unverified rather than inferred.
- Supabase project remains ACTIVE_HEALTHY on PostgreSQL 17.6; public schema has 20 tables and all 20 have RLS enabled.
- Commercial RPC privilege regression remains PASS: four atomic commercial RPCs are SECURITY INVOKER, anon EXECUTE=false, authenticated EXECUTE=true.
- Performance Advisor currently reports 19 INFO unused-index findings only; no performance migration applied because removing indexes without workload evidence is unsafe.
- Release gate remains limited to external/browser E2E evidence, CI run evidence, and optional Auth leaked-password protection hardening.
