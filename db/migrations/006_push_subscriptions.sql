-- Ejecutar en Neon: SQL Editor > pegar y correr

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_email text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null
);

create index if not exists idx_push_subscriptions_user_email on push_subscriptions (user_email);
