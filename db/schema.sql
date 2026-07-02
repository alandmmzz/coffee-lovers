-- Ejecutar esto en Neon: Dashboard > SQL Editor > pegar y correr

create extension if not exists "pgcrypto";

create table if not exists coffee_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  taster_name text not null,
  brand text not null,
  coffee_type text not null,
  origin text,
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
  notes text
);

-- Neon no maneja permisos por RLS/policies como Supabase: el control de
-- acceso queda del lado del servidor, en app/api/reviews/route.ts. Esta
-- tabla queda accesible solo a través de esa API, nunca directo desde
-- el navegador (la connection string nunca se expone al cliente).
