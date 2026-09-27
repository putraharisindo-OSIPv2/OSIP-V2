-- Release verification seed.
-- Source: SKT80S_parts.json, parser quality gate passed.
-- These are real SANY SKT80S part numbers; no pricing or supplier data is stored here.

insert into public.brands(name)
values ('SANY')
on conflict (name) do nothing;

insert into public.parts(brand_id,part_number,description)
select b.id,v.part_number,v.description
from public.brands b
cross join (values
  ('60327523','Element, Engine Oil Filter'),
  ('160102130003A089','Oil Filter'),
  ('61019554','Fuel Fine Filter'),
  ('160604020018','Fuel Fine Filter Core'),
  ('160102130003A110','Fuel Coarse Filter')
) as v(part_number,description)
where b.name='SANY'
on conflict (brand_id,part_number)
do update set description=excluded.description, updated_at=now();
