-- Nuevos cafés: Nescafé
-- Esta info viene de fichas de producto (B2B), no de fichas de catación,
-- asi que no hay datos de región/proceso en la mayoría de los casos.
-- Dejé el código FERT y el formato dentro de tasting_notes como referencia.

INSERT INTO coffees (brand, line, origin, farm, variety, process, tasting_notes) VALUES

('Nescafé', 'Fina Selección Colombia', 'Colombia', NULL, '100% arábico', NULL,
 'Café molido, elaborado con granos arábicos cuidadosamente seleccionados y tostados por expertos, que revelan sutiles aromas frutados. FERT 12481395 — 12x250g CL.'),

('Nescafé', 'Fina Selección Alta Rica', NULL, NULL, '100% arábico', NULL,
 'Café molido, elaborado con granos arábicos cuidadosamente seleccionados y tostados por expertos, que revelan sutiles aromas frutados. FERT 12481499 — 12x250g CL.'),

('Nescafé', 'Gold', NULL, NULL, '100% arábico', NULL,
 'Café molido sofisticado, tostado en una combinación de tiempo y temperatura equilibrados, con un cuerpo denso y cremoso. FERT 12511158 / 12511159 — 12x250g UY.'),

('Nescafé', 'Espresso Roast', NULL, NULL, '100% arábico', NULL,
 'Café en grano, mezcla muy equilibrada de café 100% arábica. Espresso de cuerpo entero, con notas de chocolate negro y avellanas. FERT 12409433 — 10x1kg N1 UY.'),

('Nescafé', 'Signature Blend Gabriela', NULL, NULL, 'Mix arábico y robusto', NULL,
 'Café en grano, blend a medida diseñado para el cliente, con características únicas de aroma, cuerpo y sabor a partir de granos cuidadosamente seleccionados y tostados. FERT 12481669 — 10x1kg N1 UY.');
