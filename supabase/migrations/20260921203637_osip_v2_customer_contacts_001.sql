create table public.customer_contacts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  full_name text not null,
  whatsapp text not null,
  city text not null,
  industry text not null,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customer_contacts_customer_id_idx on public.customer_contacts(customer_id);
create unique index customer_contacts_customer_whatsapp_uq on public.customer_contacts(customer_id, whatsapp);
alter table public.customer_contacts enable row level security;
grant select, insert, update, delete on public.customer_contacts to authenticated;

create policy customer_contacts_select on public.customer_contacts for select to authenticated using ((select private.osip_can('customer_contacts','select')));
create policy customer_contacts_insert on public.customer_contacts for insert to authenticated with check ((select private.osip_can('customer_contacts','insert')));
create policy customer_contacts_update on public.customer_contacts for update to authenticated using ((select private.osip_can('customer_contacts','update'))) with check ((select private.osip_can('customer_contacts','update')));
create policy customer_contacts_delete on public.customer_contacts for delete to authenticated using ((select private.osip_can('customer_contacts','delete')));

insert into private.role_permissions(role_name, table_name, can_select, can_insert, can_update, can_delete)
select r.name, 'customer_contacts',
       case when r.name in ('admin','sales','procurement') then true else false end,
       case when r.name in ('admin','sales') then true else false end,
       case when r.name in ('admin','sales') then true else false end,
       case when r.name = 'admin' then true else false end
from public.roles r
on conflict (role_name, table_name) do update
set can_select=excluded.can_select, can_insert=excluded.can_insert, can_update=excluded.can_update, can_delete=excluded.can_delete;
