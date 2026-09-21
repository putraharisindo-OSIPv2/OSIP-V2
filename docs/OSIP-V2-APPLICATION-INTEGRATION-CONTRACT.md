# OSIP V2 — Application Integration Contract

**Status:** G8 IMPLEMENTATION CONTRACT / READY

## Purpose
This contract converts the locked database foundation into the first executable application slice. It is intentionally narrow: establish a working vertical path from authenticated application access to parts discovery and RFQ persistence before expanding into quotation, PO, delivery and PM intelligence.

## Canonical runtime
- Supabase project ref: `ejszkbwaugttsarmfxxj`
- Browser/client must use the public Supabase client key only.
- Server-only operations use protected server credentials and never expose them to the browser.
- Authorization is enforced by Supabase Auth + RLS/RBAC, not by UI logic.

## Vertical slice A — Parts → RFQ
1. User authenticates through Supabase Auth.
2. Application resolves `public.users` through `auth_user_id` and obtains role context.
3. Parts search uses `public.parts` and `public.brands`.
4. Machine-aware results use `public.machines` and `public.part_machine_compatibility` when applicable.
5. Customer identity is resolved/created in `public.customers`.
6. RFQ header is created in `public.rfqs`.
7. RFQ items are created in `public.rfq_items`.
8. Only after persistence succeeds may the UI launch WhatsApp/email handoff.
9. Internal users retrieve RFQs according to role permissions.

## Search contract
Priority order:
1. exact part number
2. normalized exact part number
3. brand + part number
4. machine/model compatibility
5. description/system keyword
6. fuzzy suggestions, explicitly labeled

Never silently substitute a different PN for an exact request.

## RFQ contract
Required application identity: name, company, WhatsApp, city, industry.
Optional: email.
RFQ context: product/model, requirement, quantity, notes.

Each persisted RFQ must have a customer identity and at least one RFQ item before being treated as submitted.

## Acceptance criteria
- Login establishes a valid Supabase Auth session.
- Role resolution matches `public.users.auth_user_id`.
- Exact PN search returns the canonical `parts.id`.
- RFQ insert is denied/blocked when the caller lacks permission.
- Authorized RFQ creation persists header + items.
- WhatsApp handoff is impossible before successful persistence in application flow.
- Unauthorized users cannot read tables outside their RLS permissions.
- No service-role credential appears in client bundle/source.

## Explicit non-goals for this slice
- Do not add new public tables for convenience.
- Do not revive `rfq_sessions`, `leads`, `settings`, `activity_feed` or legacy sequence tables.
- Do not implement automatic inventory decrement.
- Do not alter locked schema without a new evidence-backed change request.
- Do not claim G8 complete until runtime evidence exists.

## Next implementation order
A1 application skeleton
A2 Supabase client/server layer
A3 Auth + role context
A4 Parts search
A5 Customer/RFQ/RFQ-item transaction
A6 WhatsApp handoff
A7 Internal RFQ workspace
A8 E2E security regression
A9 quotation vertical slice
