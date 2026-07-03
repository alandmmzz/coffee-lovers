-- Ejecutar SOLO si ya habías corrido una versión anterior de
-- 010_place_visited.sql que incluía place_id/place_address/place_lat/place_lng
-- (de cuando probamos con Google Maps / OpenStreetMap). Es opcional, son
-- columnas que quedaron sin uso, no rompen nada si las dejás.

alter table coffee_reviews drop column if exists place_id;
alter table coffee_reviews drop column if exists place_address;
alter table coffee_reviews drop column if exists place_lat;
alter table coffee_reviews drop column if exists place_lng;
