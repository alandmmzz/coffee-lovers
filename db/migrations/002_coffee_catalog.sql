-- Ejecutar en Neon: SQL Editor > pegar y correr

-- 1. Tabla de cafés (el catálogo compartido)
create table if not exists coffees (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  brand text not null,
  line text not null,
  origin text,
  process text, -- 'lavado' | 'honey' | 'natural'
  unique (brand, line)
);

-- 2. Migrar los cafés únicos que ya existen en las reviews actuales
insert into coffees (brand, line, origin)
select distinct on (brand, coffee_type) brand, coffee_type, origin
from coffee_reviews
on conflict (brand, line) do nothing;

-- 3. Agregar la referencia al café en cada review
alter table coffee_reviews add column if not exists coffee_id uuid references coffees(id);

-- 4. Completar coffee_id para las reviews que ya existían
update coffee_reviews r
set coffee_id = c.id
from coffees c
where r.brand = c.brand and r.coffee_type = c.line and r.coffee_id is null;

-- 5. Sacar las columnas viejas, ahora redundantes (marca/tipo/origen viven en `coffees`)
alter table coffee_reviews drop column if exists brand;
alter table coffee_reviews drop column if exists coffee_type;
alter table coffee_reviews drop column if exists origin;

-- 6. A partir de ahora, toda review nueva tiene que tener un café asociado
alter table coffee_reviews alter column coffee_id set not null;
