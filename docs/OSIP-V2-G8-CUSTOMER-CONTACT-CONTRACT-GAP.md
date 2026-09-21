# OSIP V2 — G8 Customer Contact Contract Gap

**Status:** IMPLEMENTED / VERIFIED  
**Decision:** Option A — dedicated customer contact entity  
**Implemented:** 2026-09-22  
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

A canonical `public.customer_contacts` entity has now been implemented containing external RFQ identity fields such as:

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

## Implemented canonical model

### Option A — Dedicated customer contact entity

The production schema now contains `customer_contacts`, linked to `customers`, and `rfqs.contact_id` is a required foreign key to the selected contact.

Advantages:
- clean domain separation;
- supports multiple contacts per customer;
- preserves external contact identity;
- supports future CRM/lead workflows.

### Option B — Not selected

Add the required fields directly to `customers`.

Advantages:
- smaller schema change.

Trade-off:
- one customer/contact model becomes less flexible.

## Decision and verification

Option A was explicitly approved by the Executive and implemented through two migrations:

- `osip_v2_customer_contacts_001`
- `osip_v2_rfq_contact_link_001`

Runtime verification confirmed the new table, RLS policies, role permissions, and required RFQ contact link. A5 is therefore unblocked.

## Already verified

The current FK is:

`customers.primary_contact_id -> users.id`

Therefore `primary_contact_id` cannot safely be reused for public/external RFQ contacts.

## G8 safety rule

RFQ persistence and WhatsApp handoff must remain disabled for incomplete customer identity. No false G8 completion claim is permitted.
