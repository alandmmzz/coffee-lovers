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

-- Las reviews NO pertenecen a un grupo: siguen siendo de quien las cargó,
-- sin importar cuándo. Un grupo es solo un círculo de visibilidad — al
-- compartir grupo con alguien, ves TODO su historial, incluso reviews de
-- antes de que existiera el grupo.
--
-- Para que nadie pierda la visibilidad que ya tenía (antes de esto,
-- cualquier usuario logueado veía a todos), creamos un grupo "Café
-- original" con todos los que ya habían dejado alguna review.
do $$
declare
  legacy_group_id uuid;
begin
  if exists (select 1 from coffee_reviews where user_email is not null)
     and not exists (select 1 from groups where name = 'Café original' and created_by = 'sistema')
  then
    insert into groups (name, invite_code, created_by)
    values ('Café original', 'legacy-' || substr(md5(random()::text), 1, 8), 'sistema')
    returning id into legacy_group_id;

    insert into group_members (group_id, user_email)
    select distinct legacy_group_id, user_email
    from coffee_reviews
    where user_email is not null
    on conflict do nothing;
  end if;
end $$;
