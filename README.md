# OSIP V2

**Revenue-first Industrial Intelligence & Procurement Platform.**

## Canonical project
- Repository: putraharisindo-OSIPv2/OSIP-V2
- Default branch: main
- Supabase project: OSIP-V2
- Supabase project ref: ejszkbwaugttsarmfxxj
- Region: Singapore / ap-southeast-1
- Database: PostgreSQL
- Architecture: canonical V2 schema + Supabase Auth + RBAC/RLS

## North Star
Visitor → Lead → Qualified Lead → RFQ → Quotation → PO → Delivery → Revenue → Repeat Order

OSIP V2 is revenue-first. Features are justified by their contribution to this chain.

## Foundation
Read docs/OSIP-V2-FOUNDATION-BLUEPRINT.md before changing architecture, schema or critical business logic.

The blueprint consolidates reusable business knowledge recovered from legacy OSCARPART/SANY/OSIP assets while keeping the current V2 database and security contract authoritative.

## Current state
The live Supabase project contains 19 canonical public base tables plus revenue_view. RBAC/RLS and database business-runtime tests have passed. Application integration is the next major gate.

See docs/OSIP-V2-LIVE-STATE.md for the latest verified database/runtime state.

## Migration rule
Production schema changes are migration-first. Never create production tables manually in the Supabase Dashboard.

The repository migration directory is not yet synchronized with the complete live migration history. This is a known repository artifact gap and must be resolved before release; it does not invalidate the live database.

## Secrets
Never commit database passwords, access tokens, service-role keys, JWT secrets, or other credentials.

## Legacy assets
Legacy source is historical/reference material. Reuse validated business logic and UX; do not revive legacy authentication, authorization or schema contracts blindly.
