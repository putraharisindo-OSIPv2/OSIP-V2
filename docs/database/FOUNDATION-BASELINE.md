# OSIP v2 Database Foundation Baseline

**WO:** OSIP-V2-WO-008.3
**Version:** 1.0
**Status:** FOUNDATION BASELINE

## Verified
- Project: OSIP-V2
- Reference: ejszkbwaugttsarmfxxj
- Region: Singapore
- Project health: Healthy
- PostgreSQL/Table Editor: accessible
- Initial public tables: 0

## Canonical workflow
1. Design/review migration.
2. Commit migration to Git.
3. Test locally.
4. Review.
5. Push to linked Supabase project.
6. Verify remote schema.
7. Record evidence.

## Deliberately deferred
Customer, Lead, Machine, Part, Compatibility, Supplier, Inventory, RFQ, Quotation, PO, Delivery, Revenue, User/Profile, RBAC, Audit and Document domains are not created by this foundation migration.

## Inventory gate
Inventory implementation remains blocked until its source of truth and actual business process are verified.

## Security
Project reference/URL are non-secret identifiers. Database passwords, CLI access tokens and service-role keys must remain in local/CI secret storage.
