-- Ejecutar en Neon: SQL Editor > pegar y correr

create table if not exists users (
  email text primary key,
  name text,
  image text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- Recuperar retroactivamente a la gente que ya dejó reviews antes de esta tabla
insert into users (email, name, image, first_seen_at, last_seen_at)
select
  user_email,
  min(user_name) as name,
  min(user_image) as image,
  min(created_at) as first_seen_at,
  max(created_at) as last_seen_at
from coffee_reviews
where user_email is not null
group by user_email
on conflict (email) do nothing;
