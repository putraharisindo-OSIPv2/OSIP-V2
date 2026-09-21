# OSIP V2 — Foundation Blueprint

**Version:** 1.0  
**Date:** 2026-09-21  
**Status:** CANONICAL PROJECT CONTEXT

## North Star
OSIP V2 is a revenue-first Industrial Intelligence & Procurement Platform.

**Visitor → Lead → Qualified Lead → RFQ → Quotation → PO → Delivery → Revenue → Repeat Order**

Every feature must improve discovery, qualification, RFQ quality, quotation conversion, fulfillment, control, or repeat revenue.

## Governing principles
- Canonical OSIP V2 architecture and schema outrank legacy architecture.
- Supabase Auth + RBAC/RLS is the authorization boundary.
- Production schema changes are migration-first and verified.
- RFQ must persist before WhatsApp/email handoff.
- Unknown remains UNKNOWN until verified.
- Reuse legacy business knowledge; do not copy legacy contracts blindly.
- Never commit passwords, tokens, service-role keys or private credentials.
- Revenue evidence must originate from operational transactions.
- Do not change locked architecture without evidence and controlled approval.

## Legacy assets
OSIP V1 New.zip is historical forensic evidence and reusable business-logic knowledge.

High-value reusable capabilities: parts search, RFQ, lead/customer capture, PM/service intelligence, equipment/model relationships, PM projection, cart-to-RFQ, RFQ import/parser, notifications, PDF/print, analytics, rate limiting and CAPTCHA/security patterns.

Do not copy blindly: legacy Express/JWT authorization, legacy password storage, rfq_sessions, rfq_number_sequences, activity_feed, legacy leads table, legacy settings/security assumptions, legacy revenue calculations, or legacy direct database access.

## Canonical V2 schema
19 public base tables: roles, users, customers, brands, suppliers, parts, part_machine_compatibility, machines, inventory, pricing, rfqs, rfq_items, quotations, quotation_items, purchase_orders, purchase_order_items, deliveries, delivery_lines, audit_events.

Plus revenue_view.

Commercial dependency: Customer / Machine / Part / Supplier → Inventory & Pricing → RFQ → RFQ Items → Quotation → Quotation Items → PO → PO Items → Delivery → Delivery Lines → Revenue → Audit.

## Security baseline
- 4 roles: admin, procurement, sales, warehouse.
- 76 RBAC permission rows.
- 19/19 public base tables have RLS enabled.
- 76 CRUD policies.
- Policies use private.osip_can().
- Current role resolution uses private.current_osip_role().
- Anonymous direct access to protected parts data has been tested and blocked.
- revenue_view authenticated access is explicitly revoked.
- osip-auth-rld-probe Edge Function is active with JWT verification.

Never use UI hiding as a security boundary.

## Industrial Intelligence
Legacy SANY logic is valuable for: Equipment/model → current HM → utilization → projected HM → maintenance events → due parts → quantity → stock/sourcing gap → RFQ.

Maintenance intervals must be sourced from authoritative OMM/parts-book evidence. The system must not invent service intervals.

Exact-first search order: exact PN → normalized exact PN → brand + PN → model + compatibility → description/system keyword → fuzzy suggestions clearly labeled as suggestions.

## Public acquisition contract
Mandatory: name, company, WhatsApp, city, industry. Optional: email. RFQ context: product/model, requirement, quantity, notes.

**Control: persist RFQ + items before launching WhatsApp.**

## Legacy → V2 mapping
- parts data → parts + part_machine_compatibility
- models → machines + brands
- PM intervals → Industrial Intelligence layer, sourced from OMM/parts book
- RFQ sessions → rfqs unless a proven business need requires otherwise
- RFQ items → rfq_items
- leads → customers plus a controlled lead/acquisition design decision
- activity feed → audit_events and/or application telemetry
- settings → application configuration/environment
- RFQ number sequence → explicit V2 numbering strategy
- legacy users/passwords → Supabase Auth + public.users bridge
- notification service → V2 notification boundary
- PDF service → quotation/RFQ/maintenance document layer

## Current gate baseline
| Gate | Status |
|---|---|
| G1 Architecture | CLOSED |
| G2 Domain | CLOSED |
| G3 Schema | CLOSED |
| G4 RBAC/RLS | VERIFIED |
| G5 Auth Runtime | PASS |
| G6 Database Business Runtime | PASS |
| G7 Artifact/Source Discovery | COMPLETED |
| G7A Frontend Source | IN PROGRESS / HARD DEPENDENCY |
| G7B Backend Compatibility | LEGACY MISMATCH IDENTIFIED |
| G7C Lead Architecture | OPEN CONTROLLED DECISION |
| G8 Application Integration | NEXT |
| G9 E2E QA | PENDING |
| G10 Production Hardening | PENDING |
| G11 RELEASE | PENDING |

## Immediate execution sequence
1. Register canonical frontend source in this repository.
2. Establish typed Supabase client/server access.
3. Implement auth/session + role context.
4. Implement exact-first parts search.
5. Implement machine/model compatibility.
6. Implement public lead/RFQ capture.
7. Persist RFQ before WhatsApp.
8. Build internal RFQ workspace.
9. Build quotation + revision.
10. Build PO conversion.
11. Build delivery workflow.
12. Verify revenue.
13. Integrate PM Intelligence.
14. Migrate validated legacy data.
15. Run full E2E and security regression.
16. Harden deployment.
17. Release only with evidence.

## Definition of Done
- Canonical source is registered here.
- App uses the canonical Supabase project.
- Public acquisition creates attributable persisted RFQs.
- RFQ → quotation → PO works.
- PO → delivery works with quantity controls.
- Revenue is measurable from operational transactions.
- RBAC/RLS blocks unauthorized operations in runtime tests.
- Critical workflows have E2E evidence.
- Production secrets are protected.
- Known release dependencies are resolved or explicitly accepted.

## Operating rule
Read this file first. Inspect the canonical repository and live database before changing architecture. Continue from the first open gate. Do not rebuild already-closed foundations without evidence of regression.

**OSIP V2 = Intelligence → Demand → RFQ → Quotation → PO → Delivery → Revenue.**
