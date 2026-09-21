alter table public.rfqs
  add column contact_id uuid not null
  references public.customer_contacts(id)
  on update restrict
  on delete restrict;

create index rfqs_contact_id_idx on public.rfqs(contact_id);
