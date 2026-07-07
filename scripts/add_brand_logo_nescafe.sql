-- Logo de marca: Nescafé

insert into brand_logos (brand, logo_url, updated_at) values
  ('Nescafé', '/images/logo-nescafe.png', now())
on conflict (brand) do update set
  logo_url = excluded.logo_url,
  updated_at = excluded.updated_at;
