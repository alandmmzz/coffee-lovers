-- Logo de marca: Culto

insert into brand_logos (brand, logo_url, updated_at) values
  ('Culto', '/images/logo-culto.png', now())
on conflict (brand) do update set
  logo_url = excluded.logo_url,
  updated_at = excluded.updated_at;
