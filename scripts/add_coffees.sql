-- Nuevos cafés: Cardenal, Starbucks, Amor Perfecto
-- id y created_at quedan con su valor por defecto

INSERT INTO coffees (brand, line, origin, farm, variety, process, tasting_notes) VALUES

-- ===== CARDENAL =====
('Cardenal', 'Etiopía', 'Etiopía, Guji', NULL, 'Heirloom Ethiopian', 'Lavado',
 'Intensos sabores a fruta, ciruela cocida, jazmín perfumado y lima fresca, con una acidez chispeante y una dulzura almibarada. Altitud: 1990-2200 msnm.'),

('Cardenal', 'Mensajero', NULL, NULL, 'Catuaí Amarillo', 'Naturales',
 'Acidez media. Notas a chocolate, dulce de leche, cacao y avellana. Altitud: 1250 msnm.'),

('Cardenal', 'Churrinche', 'Mantiqueira de Minas Gerais, Santa Maria, Huila', 'Pequeños productores', 'Catuaí Amarillo, Caturra Castillo', 'Lavado',
 'Notas a chocolate blanco y afrutado. Residual a dulce de leche y naranja. Cuerpo alto y acidez limpia. Altitud: 1250 mts, 1600-1650 mts. Puntaje: 83.'),

('Cardenal', 'Kenia', 'Kenia, Nyeri', NULL, 'Blend: Batian, SL28, SL34 y Ruiru 11', 'Lavado',
 'Sabores a cítricos frescos, cacao, amaretto y ralladura de cítricos secos, con acidez picante y buen dulzor. Altitud: 1500-1800 msnm.'),

('Cardenal', 'Vietnam', 'Lam Dong', NULL, 'Catimor', 'Lavado',
 'Notas a cacao con suaves sabores a melón fresco. Acidez y dulzor ligeramente ácidos. Altitud: 1100-1400 msnm.'),

-- ===== STARBUCKS =====
('Starbucks', 'House Blend', 'Latinoamérica', NULL, NULL, NULL,
 'Café latinoamericano cargado de sabor, equilibrando los gustos a nueces y cacao, con un toque de dulzura que aporta el tostado. Tostado medio. Generoso con notas a caramelo.'),

('Starbucks', 'Caffè Verona', NULL, NULL, NULL, NULL,
 'Tostado dulce con notas de cacao oscuro que hacen esta taza rica y equilibrada. Tostado intenso. Notas dulces y oscuras a cacao tostado.'),

('Starbucks', 'Single Origin Colombia', 'Colombia', NULL, NULL, NULL,
 'Café colombiano de origen único con cuerpo redondo, sabor jugoso y un característico final a nuez. Tostado medio. Equilibrado con notas a nuez.'),

('Starbucks', 'Pike Place Roast', 'Latinoamérica', NULL, NULL, NULL,
 'Mezcla suave y completa de cafés latinoamericanos con sabores sutilmente ricos a chocolate y nueces tostadas. Tostado medio. Suave con notas a chocolate.'),

-- ===== AMOR PERFECTO =====
('Amor Perfecto', 'Astrid Medina – Tabí', 'Gaitania – Tolima', 'Astrid Medina', 'Tabí', 'Lavado',
 'Sabor a durazno, miel y limoncillo. Aroma dulce e intenso, con notas de limoncillo y frutas amarillas maduras. Acidez media, cítrica, con recuerdo a lima. Cuerpo medio, delicado y sedoso.'),

('Amor Perfecto', 'Familia Campos Roa – Bourbon Rosado', 'Acevedo – Huila', 'Familia Campos Roa', 'Bourbon Rosado', 'Lavado',
 'Sabor a frutas rojas, miel y panela. Aroma floral y frutal, con notas dulces de miel. Acidez media-alta, brillante. Cuerpo medio y cremoso.'),

('Amor Perfecto', 'Café Antioquia', 'Antioquia', NULL, 'Blend de variedades locales', 'Lavado',
 'Sabor a chocolate, caramelo y frutos secos. Aroma dulce, con cacao y nueces. Acidez media. Cuerpo medio-alto, balanceado.'),

('Amor Perfecto', 'Café Amor Perfecto (Mezcla de la Casa)', 'Diferentes regiones de Colombia', NULL, 'Mezcla de variedades seleccionadas', 'Lavado',
 'Sabor a chocolate con leche, panela y caramelo. Aroma dulce y achocolatado. Acidez baja-media. Cuerpo medio, redondo.'),

('Amor Perfecto', 'Café Descafeinado Amor Perfecto', 'Colombia', NULL, 'Selección de variedades', 'Lavado y descafeinado mediante proceso sin solventes',
 'Sabor a chocolate, panela y almendras. Aroma dulce, con cacao y azúcar mascabo. Acidez baja-media. Cuerpo medio.'),

('Amor Perfecto', 'Café Huila', 'Huila', NULL, 'Blend regional', 'Lavado',
 'Sabor a caramelo, cítricos y chocolate. Aroma dulce con notas cítricas. Acidez media-alta. Cuerpo medio.'),

('Amor Perfecto', 'Café Insignia', 'Colombia', NULL, 'Selección de microlotes', 'Variable según el lote',
 'Sabor a frutas maduras, panela y flores. Aroma muy complejo, floral y dulce. Acidez media-alta. Cuerpo sedoso.'),

('Amor Perfecto', 'Café Nariño', 'Nariño', NULL, 'Blend regional', 'Lavado',
 'Sabor a cítricos, panela y chocolate. Aroma floral con notas cítricas. Acidez alta y brillante. Cuerpo medio, limpio.'),

('Amor Perfecto', 'Café Tras la Perla – Sierra Nevada', 'Sierra Nevada de Santa Marta', NULL, 'Variedades tradicionales colombianas', 'Lavado',
 'Sabor a cacao, panela y frutas amarillas. Aroma dulce con notas a cacao y frutas. Acidez media. Cuerpo medio-alto y jugoso.'),

('Amor Perfecto', 'Astrid Medina – Geisha', 'Gaitania – Tolima', 'Astrid Medina', 'Geisha', 'Lavado',
 'Sabor a jazmín, durazno y miel. Aroma muy floral, con notas de jazmín, cítricos y frutas de carozo. Acidez alta, brillante y elegante. Cuerpo ligero a medio, sedoso.'),

('Amor Perfecto', 'Barrica', 'Colombia', NULL, 'Selección de variedades', 'Madurado en barrica de roble',
 'Sabor a chocolate oscuro, vainilla, caramelo y frutos secos. Aroma dulce, con notas de madera, vainilla y cacao. Acidez media-baja. Cuerpo medio-alto, cremoso.'),

('Amor Perfecto', 'Frida Kahlo – Caturra Castillo', 'Gaitania – Tolima', 'Astrid Medina', 'Caturra y Castillo', 'Lavado',
 'Sabor a frutos rojos, miel y panela. Aroma floral, dulce y afrutado. Acidez media, balanceada. Cuerpo medio y sedoso.'),

('Amor Perfecto', 'Elías Roa – Bourbon', 'Acevedo – Huila', 'Elías Roa', 'Bourbon', 'Lavado',
 'Sabor a panela, durazno y cítricos. Aroma dulce, floral y frutal. Acidez media-alta. Cuerpo medio, cremoso.'),

('Amor Perfecto', 'Elías Roa – Caturra', 'Acevedo – Huila', 'Elías Roa', 'Caturra', 'Lavado',
 'Sabor a caramelo, naranja y miel. Aroma dulce, con notas cítricas y florales. Acidez media. Cuerpo medio.'),

('Amor Perfecto', 'Familia Campos Roa – Colombia Natural', 'Acevedo – Huila', 'Familia Campos Roa', 'Colombia', 'Natural',
 'Sabor a frutas tropicales, frutos rojos y panela. Aroma muy frutal, con notas de frutas maduras y fermentación controlada. Acidez media-alta. Cuerpo alto, jugoso.'),

('Amor Perfecto', 'Jorge Rojas – Geisha', 'Huila', 'Jorge Rojas', 'Geisha', 'Lavado',
 'Sabor a jazmín, bergamota, miel y durazno. Aroma intensamente floral y cítrico. Acidez alta, elegante. Cuerpo ligero y sedoso.'),

('Amor Perfecto', 'Óscar Ruiz – Castillo', 'Huila', 'Óscar Ruiz', 'Castillo', 'Lavado',
 'Sabor a chocolate, panela y naranja. Aroma dulce, con notas de cacao y cítricos. Acidez media. Cuerpo medio.'),

('Amor Perfecto', 'Wilton Benítez – Bourbon Amarillo', 'Cauca', 'Wilton Benítez', 'Bourbon Amarillo', 'Fermentación controlada y lavado',
 'Sabor a maracuyá, mango, miel y frutas tropicales. Aroma muy intenso, tropical y floral. Acidez alta, jugosa. Cuerpo medio, muy sedoso.'),

('Amor Perfecto', 'Mezcla Especial Samuel Bermúdez', 'Cauca', 'Samuel Bermúdez', 'Mezcla de variedades especiales', 'Fermentación controlada',
 'Sabor a frutas tropicales, panela, miel y flores. Aroma muy complejo, floral y frutal. Acidez media-alta. Cuerpo cremoso y persistente.');
