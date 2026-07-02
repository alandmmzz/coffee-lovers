-- Ejecutar esto en Neon: Dashboard > SQL Editor > pegar y correr

create extension if not exists "pgcrypto";

-- Usuarios que iniciaron sesión al menos una vez (se registra en cada login,
-- incluso si esa persona nunca llega a dejar una review)
create table if not exists users (
  email text primary key,
  name text,
  image text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- Catálogo de cafés: Marca + Línea/Tipo, con Origen y Proceso fijos por café
create table if not exists coffees (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  brand text not null,
  line text not null,
  origin text,
  farm text,
  variety text,
  process text, -- texto libre: 'Lavado', 'Honey', 'Natural', 'Fermentación anaeróbica', etc.
  tasting_notes text, -- notas de cata del tostador (distinto a las notas de cada review)
  unique (brand, line)
);

create table if not exists coffee_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  taster_name text not null,
  coffee_id uuid not null references coffees(id),
  roast_level text,
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
  has_milk boolean not null default false,
  milk_type text,
  user_email text,
  user_name text,
  user_image text
);

create index if not exists idx_coffee_reviews_user_email on coffee_reviews (user_email);
create index if not exists idx_coffee_reviews_coffee_id on coffee_reviews (coffee_id);

-- Suscripciones a notificaciones push, una fila por dispositivo que las activó
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_email text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null
);

create index if not exists idx_push_subscriptions_user_email on push_subscriptions (user_email);

-- Neon no maneja permisos por RLS/policies como Supabase: el control de
-- acceso queda del lado del servidor, en las API routes. Estas tablas
-- quedan accesibles solo a través de esas rutas, nunca directo desde
-- el navegador (la connection string nunca se expone al cliente).

-- Para precargar el catálogo de cafés de Doré, correr después:
-- db/seeds/dore.sql
