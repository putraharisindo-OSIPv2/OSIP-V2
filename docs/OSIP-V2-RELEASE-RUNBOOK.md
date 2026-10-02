# OSIP V2 — Release Runbook

## Purpose
Close the remaining external verification gates and record the production release evidence without changing the verified application architecture.

## Current release state
**RELEASE READY — FREE-PLAN SECURITY LIMITATION DOCUMENTED**

Production repository:
`putraharisindo-OSIPv2/OSIP-V2`

Current application commit before this documentation update:
`3b83bd5d2991ab2c7cbe06300d84c1e18b476131`

Production application:
`https://osip-v2.vercel.app`

## Gate A — GitHub Actions

Workflow:
`.github/workflows/ci.yml`

Expected job:
- checkout
- Node.js 20
- `npm install`
- `npm run build`

**External evidence: PASS**

GitHub Actions run #19 for commit `3b83bd5d2991ab2c7cbe06300d84c1e18b476131` completed successfully on 2026-10-01.

## Gate B — Browser production E2E

**External evidence: PASS**

### Customer path verified
Production browser test completed:

1. Open Parts.
2. Search real part `60327523`.
3. Open the part.
4. Click Request Quote.
5. Submit customer/company/contact/WhatsApp/city/industry/quantity.
6. RFQ created successfully.
7. WhatsApp handoff available.
8. RFQ visible in internal workspace.

Verified clean RFQ:
`RFQ-20261001045422525-4C83DF89`

### Internal commercial path verified

Correct sales workflow:

**Customer RFQ → OSCARPART Quotation → Customer PO → OSCARPART Sales Order → Delivery**

Verified:

- Quotation: `QUO-20261001045614860-86B34F1B` — `ISSUED`
- Customer PO: `CPO-OSCAR-TEST-001` — simulated test customer PO
- Sales Order: `SO-20261001095157870-1C033FC4` — `COMPLETED`
- Delivery: `DEL-20261001095239260-441313E6` — `DELIVERED`
- Operational delivered sales value: IDR 1,000,000 for the test quantity and unit price.

The customer PO was explicitly entered as a customer-provided document number. OSCARPART did not generate a customer PO.

**Important evidence qualification:** this was a controlled technical E2E test. The simulated customer PO and IDR 1,000,000 delivered sales value are workflow evidence, not evidence of cash received from a real customer.

A legacy technical test record remains visible and is explicitly labeled in the workspace as not being evidence of a real customer PO.

## Gate C — Supabase Auth and database security hardening

**External evidence: PASS WITH FREE-PLAN LIMITATION**

Completed hardening:

- `private.role_permissions` RLS enabled.
- Direct client access to `private.role_permissions` denied by policy.
- Production commercial workflow remained functional after the RLS change.
- Temporary `osip-auth-admin-repair` Edge Function deleted after successful Auth repair.
- Temporary `osip_auth_admin` custom secret removed; Supabase reports no custom secrets.
- Supabase Security Advisor now reports **0 errors, 1 warning, 0 info**.

Remaining warning:
`auth_leaked_password_protection`

Supabase documents that leaked-password protection is available on the Pro Plan and above. The production project is on the Free Plan, so this control cannot be enabled on the current plan.

This is a documented platform-plan limitation, not an unresolved application/schema defect.

## Already verified

- 20 public application tables.
- RLS enabled across the exposed application tables.
- 4 commercial atomic RPCs exist and are SECURITY INVOKER.
- Anonymous direct execution of `create_rfq_atomic` is denied.
- Authenticated execution is allowed.
- `revenue_view` is not selectable by authenticated clients.
- Database RFQ → quotation → customer PO → sales order → delivery runtime test passed.
- Public RFQ Edge Function `osip-public-rfq-v2` is ACTIVE with JWT verification intentionally disabled because it is the public acquisition boundary.
- Verified SANY SKT80S release parts are seeded in production, including PNs `60327523`, `160102130003A089`, `61019554`, `160604020018`, and `160102130003A110`.

## Performance note

Performance Advisor may report unused-index INFO findings. Do not remove indexes merely to make the advisor green; workload evidence and query plans should drive index cleanup.

## Release rule

Gates A and B have external evidence.

Gate C has external evidence of database/RLS hardening and zero security errors, with one Free-Plan-only Auth warning that cannot be enabled on the current plan.

No additional feature development is required for operational release.

**Release decision recorded by this runbook: OSIP V2 is RELEASE READY with the documented Free-Plan security limitation.**

Future hardening item:
- Enable leaked-password protection if/when the project moves to a Supabase plan that provides the feature.

