-- Ejecutar en Neon: SQL Editor > pegar y correr

alter table coffee_reviews add column if not exists consumption_type text; -- 'lugar' | 'casa'
alter table coffee_reviews add column if not exists place_id text;
alter table coffee_reviews add column if not exists place_name text;
alter table coffee_reviews add column if not exists place_address text;
alter table coffee_reviews add column if not exists place_lat double precision;
alter table coffee_reviews add column if not exists place_lng double precision;

create index if not exists idx_coffee_reviews_place_id on coffee_reviews (place_id);
