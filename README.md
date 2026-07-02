# Coffee Lovers ☕

Ficha de catación de café: un formulario donde registrás cada café que probás
(marca, tipo dentro de la marca, tueste, método de preparación) y lo valorás
en atributos sensoriales (aroma, acidez, dulzor, cuerpo, amargor, retrogusto,
balance) más un puntaje general. Cada envío se guarda en Neon (Postgres), y
hay una página `/reviews` para ver el historial de todo lo catado.

## 1. Crear el proyecto en Neon

1. Entrá a [neon.tech](https://neon.tech) y creá un proyecto nuevo (gratis).
2. Andá a **SQL Editor**, pegá el contenido de
   [`db/schema.sql`](./db/schema.sql) y ejecutalo. Esto crea la tabla
   `coffee_reviews`.
3. En el dashboard del proyecto, copiá el **Connection string** (algo como
   `postgresql://usuario:password@host.neon.tech/dbname?sslmode=require`).

## 2. Configurar variables de entorno

Copiá `.env.example` como `.env.local` y completá con el connection string:

```bash
cp .env.example .env.local
```

```
DATABASE_URL=postgresql://usuario:password@host.neon.tech/dbname?sslmode=require
```

## 3. Correr localmente

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## 4. Deploy en Vercel

1. Subí este código a tu repo de GitHub (`alandmmzz/coffee-lovers`).
2. En [vercel.com](https://vercel.com), **Add New Project** → importá el repo.
3. En **Environment Variables**, cargá `DATABASE_URL` con el mismo connection
   string del paso 2.
4. Deploy. Listo, ya tenés el link para compartir y que la gente cargue sus catas.

## Cómo está armado (a diferencia de Supabase)

Con Neon no hay un cliente que inserte directo desde el navegador con
permisos por policy, como sí pasa con Supabase. Acá el flujo es:

- El navegador manda los datos del form a `app/api/reviews/route.ts`
  (una API route de Next.js).
- Esa ruta, que corre en el servidor, es la única que tiene el
  `DATABASE_URL` y habla con Neon.
- La página `/reviews` es un server component, así que puede consultar la
  base directo (sin pasar por la API route) porque también corre en el
  servidor.

Esto es más seguro por diseño: el connection string nunca llega al navegador.

## Estructura

- `app/page.tsx` — formulario principal (ficha de catación)
- `app/reviews/page.tsx` — listado de todas las reviews guardadas
- `app/api/reviews/route.ts` — API route que inserta y lista reviews en Neon
- `app/components/RoastSelector.tsx` — selector visual de nivel de tueste
- `app/components/ScoreScale.tsx` — escala de puntuación 1-5 por atributo
- `lib/db.ts` — cliente de conexión a Neon y tipos
- `db/schema.sql` — script para crear la tabla

## Ampliar más adelante

Si en algún momento querés restringir quién puede cargar reviews (por
ejemplo, con una contraseña compartida o login), lo más simple es agregar
una verificación en `app/api/reviews/route.ts` antes del insert — avisame y
te ayudo a armarlo.
