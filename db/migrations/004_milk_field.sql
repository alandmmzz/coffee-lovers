-- Ejecutar en Neon: SQL Editor > pegar y correr

alter table coffee_reviews add column if not exists has_milk boolean not null default false;
alter table coffee_reviews add column if not exists milk_type text;
