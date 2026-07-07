-- Logos de marca: Starbucks y Amor Perfecto
-- Usa upsert, igual que hace /api/brand-logos

insert into brand_logos (brand, logo_url, updated_at) values
  ('Starbucks', '/images/logo-starbucks.png', now()),
  ('Amor Perfecto', '/images/logo-amor-perfecto.png', now())
on conflict (brand) do update set
  logo_url = excluded.logo_url,
  updated_at = excluded.updated_at;
