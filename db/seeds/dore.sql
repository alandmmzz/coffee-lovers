-- Ejecutar en Neon: SQL Editor > pegar y correr
-- Requiere haber corrido antes db/migrations/003_coffee_details.sql
-- Carga (o actualiza si ya existen) los cafés de Doré: cafe-dore.com/nuestros-cafes

insert into coffees (brand, line, origin, farm, variety, process, tasting_notes)
values
  ('Doré', '01', 'Brasil, Mantiqueira de Minas', 'Capadoccia', 'Catuaí rojo', 'Natural', 'Chocolate, caramelo y nuez.'),
  ('Doré', '03', 'Brasil, Minas Gerais', 'Fazendas Klem', 'Catuaí amarillo', 'Fermentación anaeróbica', 'Frutos rojos, uva, mora, ciruela negra.'),
  ('Doré', '04', 'Etiopía, Yirgacheffe', 'Adado', 'Heirloom (nativa)', 'Natural', 'Frutos rojos, praliné, cacao y acidez suave.'),
  ('Doré', '05', 'Kenya, Kirinyaga', 'Varias de Uteuzi Jimbo', 'Batian, SL28, SL34, Ruiru 11', 'Lavado', 'Azúcar moreno, naranja, pera asada y acidez frutal.'),
  ('Doré', '06', 'República Dominicana', 'La Tambora', 'Caturra y Typica', 'Lavado', 'Cacao, caramelo y pasas de uva.'),
  ('Doré', '07', 'Honduras', 'Santa Elena', 'Catuaí Rojo', 'Lavado', 'Chocolate, cítrico, limpio.'),
  ('Doré', '08', 'Brasil, Caparaó', 'Santa Rita', 'Catuaí Rojo', 'Honey', 'Chocolate, castaña, almendras.'),
  ('Doré', '09', 'Bolivia, Inquisivi', 'Carlos Nina', 'Catuaí Rojo', 'Lavado', 'Chocolate, naranja, pasas de uva.'),
  ('Doré', '10', 'Colombia, Huila', 'Yiver Vargas - Cooperativa de mujeres', 'Blend regional', 'Lavado', 'Azúcar moreno, caramelo, acidez cítrica.'),
  ('Doré', '11', 'Colombia, Huila', 'Diego Horta', 'Caturra, Colombia, Castillo', 'Natural fermentado', 'Afrutado, frambuesa, azúcar moreno.'),
  ('Doré', '12', 'Bolivia, La Paz, Caranavi', 'Blend Regional', 'Catuaí', 'Natural', 'Miel, durazno, vino, frutos rojos.'),
  ('Doré', '13', 'Brasil, Mantiqueira de Minas', 'Capadoccia', 'Bourbon Amarillo', 'Natural', 'Miel, ananá, caña de azúcar.'),
  ('Doré', '14', 'Bolivia - Brasil', 'Carlos Nina y Capadoccia', 'Catuaí Rojo', null, 'Chocolate, naranja, caramelo, pasas de uva.')
on conflict (brand, line) do update set
  origin = excluded.origin,
  farm = excluded.farm,
  variety = excluded.variety,
  process = excluded.process,
  tasting_notes = excluded.tasting_notes;
