-- Ejecutar en Neon: SQL Editor > pegar y correr

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  image_url text,
  invite_code text not null unique,
  created_by text not null
);

create table if not exists group_members (
  group_id uuid not null references groups(id) on delete cascade,
  user_email text not null,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_email)
);

create index if not exists idx_group_members_user_email on group_members (user_email);

alter table coffee_reviews add column if not exists group_id uuid references groups(id);

-- Crear un grupo "Café original" con todas las reviews que ya existían antes
-- de esta migración, y sumar como miembros a todos los que ya habían
-- participado (así nadie pierde acceso a su propio historial).
do $$
declare
  legacy_group_id uuid;
begin
  if exists (select 1 from coffee_reviews where group_id is null) then
    insert into groups (name, invite_code, created_by)
    values ('Café original', 'legacy-' || substr(md5(random()::text), 1, 8), 'sistema')
    returning id into legacy_group_id;

    update coffee_reviews set group_id = legacy_group_id where group_id is null;

    insert into group_members (group_id, user_email)
    select distinct legacy_group_id, user_email
    from coffee_reviews
    where user_email is not null
    on conflict do nothing;
  end if;
end $$;

alter table coffee_reviews alter column group_id set not null;
