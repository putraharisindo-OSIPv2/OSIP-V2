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

## Current gate state
- G8 A5 Customer/Contact/RFQ: IMPLEMENTED
- G8 A6 WhatsApp: IMPLEMENTED
- G8 A7 Internal RFQ Workspace: IMPLEMENTED
- G8 A8 Security Regression: VERIFIED
- G8 A9 Quotation Slice: IMPLEMENTED + atomic runtime test PASS
- G8 A10 PO/Delivery Slice: IMPLEMENTED + atomic runtime test PASS
- G9 E2E QA: PENDING
- G10 Production Hardening: PENDING
- G11 RELEASE: PENDING

## Release blockers
1. Public acquisition/RFQ path is still authenticated-only; a controlled public lead-capture boundary is required before public production use.
2. Browser/runtime E2E evidence is still pending.
3. Revenue view is operationally derived from delivery lines, but final customer-facing commercial workflow and revenue verification still need E2E coverage.
4. Production Auth leaked-password protection warning remains.
5. Final deployment/build verification remains pending.

The recovered legacy OSCARPART/SANY source remains reference material until adapted to the V2 contract.