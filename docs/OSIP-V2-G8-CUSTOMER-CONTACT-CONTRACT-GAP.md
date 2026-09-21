# OSIP V2 — G8 Customer Contact Contract Gap

**Status:** BLOCKED AT APPROVAL GATE  
**Detected:** 2026-09-21  
**Scope:** A5 Customer → RFQ → RFQ Item

## Finding

The locked canonical schema has:

- `customers.id`
- `customers.company_name`
- `customers.tax_id`
- `customers.primary_contact_id`
- `customers.created_at`
- `customers.updated_at`

`customers.primary_contact_id` references `public.users.id`.

There is no canonical customer-contact entity containing external RFQ identity fields such as:

- contact name
- WhatsApp / phone
- city
- industry
- email

The application integration contract requires those fields for every submitted RFQ.

## Consequence

The application must not:

1. store external contact data in unrelated columns;
2. treat an internal `users` row as the external customer contact;
3. revive legacy `leads`, `rfq_sessions`, or `settings`;
4. silently discard required lead identity;
5. mark an RFQ submitted without the required identity.

## Safe options requiring Executive/CTO approval

### Option A — Add canonical customer contact model

Introduce a dedicated contact entity and reference it from customers.

Advantages:
- clean domain separation;
- supports multiple contacts per customer;
- preserves external contact identity;
- supports future CRM/lead workflows.

### Option B — Extend customers with contact fields

Add the required fields directly to `customers`.

Advantages:
- smaller schema change.

Trade-off:
- one customer/contact model becomes less flexible.

## Current decision

No production schema change is executed by this artifact.

A5 remains blocked until an approved canonical model is selected and implemented through a migration with runtime verification.

## Already verified

The current FK is:

`customers.primary_contact_id -> users.id`

Therefore `primary_contact_id` cannot safely be reused for public/external RFQ contacts.

## G8 safety rule

RFQ persistence and WhatsApp handoff must remain disabled for incomplete customer identity. No false G8 completion claim is permitted.
