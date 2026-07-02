-- Ejecutar en Neon: SQL Editor > pegar y correr

alter table coffees add column if not exists farm text;
alter table coffees add column if not exists variety text;
alter table coffees add column if not exists tasting_notes text;

-- Nota: `process` ya era texto libre (sin CHECK constraint), así que
-- procesos como "Fermentación anaeróbica" o "Natural fermentado" entran
-- sin problema, no solo lavado/honey/natural.
