-- Ejecutar en Neon: SQL Editor > pegar y correr
-- (solo si ya corriste db/schema.sql antes; agrega las columnas de usuario)

alter table coffee_reviews add column if not exists user_email text;
alter table coffee_reviews add column if not exists user_name text;
alter table coffee_reviews add column if not exists user_image text;

-- Índice para que "mis reviews" en el perfil sea rápido de consultar
create index if not exists idx_coffee_reviews_user_email on coffee_reviews (user_email);
