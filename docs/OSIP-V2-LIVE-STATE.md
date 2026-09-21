# OSIP V2 — Live State Register

**Verified:** 2026-09-21

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

## Security verification
- RLS enabled on all 19 public base tables.
- 76 CRUD policies exist for authenticated access.
- Policies use private.osip_can().
- Current role helper: private.current_osip_role().
- Anonymous protected-table access was tested and blocked.
- Revenue view authenticated access was explicitly revoked.
- Auth/RLS probe Edge Function is active with JWT verification.

## Current advisors
Security: one warning remains — leaked-password protection is disabled in Supabase Auth.

Performance: 21 unused-index INFO findings. Do not delete these indexes solely because of the advisory; validate workload/query plans first.

## Repository drift
The GitHub repository currently contains one historical foundation migration from August 2026 while the live project contains the 13 migrations listed above. This is a migration-repository synchronization gap, not evidence that the live database is empty.

The old README statement that the remote public schema was intentionally empty is stale and must not be used as current-state truth.

## Next gate
G8 Application Integration is the next execution gate. Frontend source is not yet registered in the canonical repository. Legacy OSCARPART/SANY code remains reference material until adapted to the V2 contract.
