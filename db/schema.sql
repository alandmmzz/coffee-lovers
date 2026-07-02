-- Ejecutar esto en Neon: Dashboard > SQL Editor > pegar y correr

create extension if not exists "pgcrypto";

-- Catálogo de cafés: Marca + Línea/Tipo, con Origen y Proceso fijos por café
create table if not exists coffees (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  brand text not null,
  line text not null,
  origin text,
  process text, -- 'lavado' | 'honey' | 'natural'
  unique (brand, line)
);

create table if not exists coffee_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  taster_name text not null,
  coffee_id uuid not null references coffees(id),
  roast_level text not null,
  brew_method text not null,
  aroma smallint not null check (aroma between 1 and 5),
  acidity smallint not null check (acidity between 1 and 5),
  sweetness smallint not null check (sweetness between 1 and 5),
  body smallint not null check (body between 1 and 5),
  bitterness smallint not null check (bitterness between 1 and 5),
  aftertaste smallint not null check (aftertaste between 1 and 5),
  balance smallint not null check (balance between 1 and 5),
  overall_rating smallint not null check (overall_rating between 1 and 10),
  price numeric,
  notes text,
  user_email text,
  user_name text,
  user_image text
);

create index if not exists idx_coffee_reviews_user_email on coffee_reviews (user_email);
create index if not exists idx_coffee_reviews_coffee_id on coffee_reviews (coffee_id);

-- Neon no maneja permisos por RLS/policies como Supabase: el control de
-- acceso queda del lado del servidor, en las API routes. Estas tablas
-- quedan accesibles solo a través de esas rutas, nunca directo desde
-- el navegador (la connection string nunca se expone al cliente).
