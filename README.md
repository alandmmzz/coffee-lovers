# Coffee Lovers ☕

Ficha de catación de café: un formulario donde registrás cada café que probás
(marca, tipo dentro de la marca, tueste, método de preparación) y lo valorás
en atributos sensoriales (aroma, acidez, dulzor, cuerpo, amargor, retrogusto,
balance) más un puntaje general. Hay que iniciar sesión con GitHub o Google
para cargar una review, así cada una queda asociada a tu perfil. `/reviews`
muestra el archivo completo de la comunidad y `/profile` muestra solo las tuyas.

## 1. Crear el proyecto en Neon

1. Entrá a [neon.tech](https://neon.tech) y creá un proyecto nuevo (gratis).
2. Andá a **SQL Editor**, pegá el contenido de
   [`db/schema.sql`](./db/schema.sql) y ejecutalo. Esto crea la tabla
   `coffee_reviews` (ya incluye las columnas de usuario).
   - Si ya habías corrido una versión anterior del schema sin las columnas
     de usuario, corré en cambio
     [`db/migrations/001_add_user_fields.sql`](./db/migrations/001_add_user_fields.sql).
3. En el dashboard del proyecto, copiá el **Connection string**.

## 2. Crear la app de OAuth en GitHub

1. Andá a [github.com/settings/developers](https://github.com/settings/developers) → **New OAuth App**.
2. Completá:
   - **Homepage URL**: `http://localhost:3000` (o tu dominio de producción)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Al crearla te da un **Client ID** y podés generar un **Client Secret**.

Para producción vas a necesitar repetir esto (o agregar el callback URL de
Vercel a la misma app, GitHub permite un solo callback por app así que lo
más simple es crear una segunda OAuth App para producción con el dominio real).

## 3. Crear el cliente de OAuth en Google

1. Andá a [console.cloud.google.com](https://console.cloud.google.com/) →
   **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
2. Tipo de aplicación: **Web application**.
3. En **Authorized redirect URIs** agregá:
   `http://localhost:3000/api/auth/callback/google`
   (y después el equivalente con tu dominio de producción).
4. Te da un **Client ID** y un **Client Secret**.

## 4. Configurar variables de entorno

Copiá `.env.example` como `.env.local`:

```bash
cp .env.example .env.local
```

Y completá:

```
DATABASE_URL=postgresql://usuario:password@host.neon.tech/dbname?sslmode=require

NEXTAUTH_SECRET=          # generalo con: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

GITHUB_ID=
GITHUB_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## 5. Correr localmente

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## 6. Deploy en Vercel

1. Subí este código a tu repo de GitHub (`alandmmzz/coffee-lovers`).
2. En [vercel.com](https://vercel.com), **Add New Project** → importá el repo.
3. En **Environment Variables**, cargá las mismas variables del paso 4, pero
   con `NEXTAUTH_URL` apuntando a tu dominio de producción (ej.
   `https://coffee-lovers.vercel.app`).
4. Actualizá los callback URLs en GitHub y Google con ese mismo dominio
   (o creá apps/clientes separados para prod, como se sugiere arriba).
5. Deploy.

## Cómo funciona el login

- NextAuth maneja las sesiones con JWT (no hace falta una tabla de usuarios
  en la base — los datos del usuario logueado viven en la sesión).
- Cada review guardada lleva `user_email`, `user_name` y `user_image` del
  usuario que la cargó.
- `app/api/reviews/route.ts` exige sesión activa antes de guardar una review.
- `/profile` filtra las reviews por `user_email` de la sesión actual.
- El avatar arriba a la derecha (`app/components/UserMenu.tsx`) muestra el
  dropdown de login/logout en toda la app.

## Estructura

- `app/page.tsx` — formulario principal (pide login si no hay sesión)
- `app/reviews/page.tsx` — archivo público de todas las reviews
- `app/profile/page.tsx` — reviews propias del usuario logueado
- `app/api/reviews/route.ts` — API route que inserta y lista reviews
- `app/api/auth/[...nextauth]/route.ts` — endpoints de NextAuth
- `app/components/UserMenu.tsx` — avatar + dropdown de login/logout
- `app/components/Header.tsx` — header compartido en todas las páginas
- `app/components/AuthProvider.tsx` — wrapper del SessionProvider
- `app/components/ReviewCard.tsx` — tarjeta de review reutilizada en /reviews y /profile
- `lib/auth.ts` — configuración de NextAuth (providers, callbacks)
- `lib/db.ts` — cliente de conexión a Neon y tipos
- `db/schema.sql` — script para crear la tabla desde cero
- `db/migrations/001_add_user_fields.sql` — migración si ya tenías la tabla sin usuarios
