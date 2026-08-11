-- OSIP v2 — Database Foundation
-- WO: OSIP-V2-WO-008.3
-- FOUNDATION BASELINE
--
-- Intentionally creates NO business/domain tables.
-- Domain schema follows separate evidence/architecture gates.

begin;

create extension if not exists pgcrypto;

-- Reserved internal namespace for future server-side functions.
-- It is not intended to become a public API surface.
create schema if not exists private;

comment on schema private is
  'OSIP v2 internal schema; not intended as a public API surface.';

commit;
