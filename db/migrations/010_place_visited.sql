-- Ejecutar en Neon: SQL Editor > pegar y correr

alter table coffee_reviews add column if not exists consumption_type text; -- 'lugar' | 'casa'
alter table coffee_reviews add column if not exists place_name text;
