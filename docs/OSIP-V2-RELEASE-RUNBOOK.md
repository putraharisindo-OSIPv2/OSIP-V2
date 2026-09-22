# OSIP V2 — Release Runbook

## Purpose
Close the remaining external verification gates without changing the already-verified application architecture.

## Current release state
**RELEASE CANDIDATE READY — EXTERNAL VERIFICATION PENDING**

Latest verified repository commit:
`30d6819d5bfc3c6c8bff0fa1688528f899a2b603`

## Gate A — GitHub Actions
Workflow:
`.github/workflows/ci.yml`

Expected job:
- checkout
- Node.js 20
- `npm install`
- `npm run build`

The workflow is configured for pushes to `main` and pull requests. The available GitHub connector cannot currently provide a push-triggered run for the release commit, so a PASS must only be recorded after GitHub itself shows a successful run.

## Gate B — Browser production E2E
Execute against the deployed production URL:

### Customer path
1. Open Parts.
2. Search for a real part.
3. Open the part.
4. Click RFQ.
5. Submit company, contact name, WhatsApp, city, industry, quantity.
6. Confirm successful RFQ response.
7. Confirm WhatsApp handoff is generated.
8. Verify the RFQ appears in the internal RFQ workspace.

### Internal commercial path
1. Open the RFQ workspace as an authorized internal user.
2. Confirm customer/contact and requested part are visible.
3. Create a draft quotation.
4. Create PO from the quotation.
5. Create delivery from the PO.
6. Confirm quotation becomes ISSUED.
7. Confirm PO becomes COMPLETED after delivery.
8. Confirm delivery becomes DELIVERED.
9. Confirm operational revenue is represented by delivered quantity × unit price.

Do not mark this gate PASS from code inspection alone.

## Gate C — Supabase Auth hardening
Supabase Security Advisor currently reports:
- `auth_leaked_password_protection` = WARN

Enable leaked-password protection in the Supabase Auth password-security settings, then rerun Security Advisor.

This setting is dashboard/project configuration rather than application schema code.

## Already verified
- 20 public tables.
- RLS enabled across the exposed application tables.
- 4 commercial atomic RPCs exist and are SECURITY INVOKER.
- Anonymous direct execution of `create_rfq_atomic` is denied.
- Authenticated execution is allowed.
- `revenue_view` is not selectable by authenticated clients.
- Database RFQ → quotation → PO → delivery → revenue runtime test passed and was rolled back.
- Public RFQ Edge Function `osip-public-rfq-v2` is ACTIVE with JWT verification intentionally disabled because it is the public acquisition boundary.

## Performance note
Security Advisor has one WARN for leaked-password protection.
Performance Advisor reports 19 unused-index INFO findings. Do not remove these indexes merely to make the advisor green; workload evidence and query plans should drive index cleanup.

## Release rule
Do not label OSIP V2 FINAL RELEASE until Gates A, B and C have external evidence. No additional feature development is required to close these gates.
