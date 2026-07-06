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
   [`db/schema.sql`](./db/schema.sql) y ejecutalo. Esto crea las tablas
   `coffees` (el catálogo) y `coffee_reviews` (ya con `coffee_id` en vez de
   marca/tipo/origen sueltos).
   - Si ya tenías la tabla de una versión anterior, corré en orden:
     [`db/migrations/001_add_user_fields.sql`](./db/migrations/001_add_user_fields.sql),
     [`db/migrations/002_coffee_catalog.sql`](./db/migrations/002_coffee_catalog.sql),
     [`db/migrations/003_coffee_details.sql`](./db/migrations/003_coffee_details.sql),
     [`db/migrations/004_milk_field.sql`](./db/migrations/004_milk_field.sql),
     [`db/migrations/005_users_table.sql`](./db/migrations/005_users_table.sql),
     [`db/migrations/006_push_subscriptions.sql`](./db/migrations/006_push_subscriptions.sql),
     [`db/migrations/007_roast_level_optional.sql`](./db/migrations/007_roast_level_optional.sql),
     [`db/migrations/008_temperature_preference.sql`](./db/migrations/008_temperature_preference.sql),
     [`db/migrations/009_groups.sql`](./db/migrations/009_groups.sql) (esta
     crea un grupo "Café original" con todo tu historial previo, y
     agrega como miembros a todos los que ya habían participado)
     y [`db/migrations/010_place_visited.sql`](./db/migrations/010_place_visited.sql).
   - Opcional: corré [`db/seeds/dore.sql`](./db/seeds/dore.sql) para precargar
     el catálogo de cafés de Doré (marca, línea, finca, variedad, proceso y
     notas del tostador de cada uno).
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

## Catálogo de cafés

En vez de escribir marca y línea a mano en cada review, el form busca dentro
de un catálogo compartido (`coffees`: marca, línea/tipo, origen, proceso).
Si no existe el café, se puede crear ahí mismo desde el selector — queda
disponible para todos los usuarios a partir de ese momento. El proceso
(lavado/honey/natural/etc.) y el origen viven en el café, no en cada review,
porque son características fijas del producto.

## Perfil

`/profile` muestra, además de la lista de tus propias reviews:
- Total de cafés catados y puntaje promedio.
- **Café favorito**: el que tiene mejor promedio entre los que probaste
  (desempata por cantidad de veces catado).
- **Último catado**: la review más reciente.
- Un **calendario de actividad estilo GitHub** (`ActivityHeatmap`), con
  la cantidad de reviews por día del último año, en tonos marrones acordes
  a la paleta del proyecto.
- Cada review propia tiene un link para **editarla** (marca, tueste,
  atributos, todo) y un botón para **eliminarla** (pide confirmación antes).
  Solo el dueño de la review puede editarla o borrarla — se valida
  tanto en la página (`app/reviews/[id]/edit`) como en la API
  (`app/api/reviews/[id]/route.ts`, comparando el email de la sesión).

## Panel de admin

`/admin/users` lista a todas las personas que alguna vez iniciaron sesión
(hayan dejado una review o no), con cuántas reviews dejó cada una y cuándo
fue su última actividad. Está protegido por la variable `ADMIN_EMAIL`: solo
la sesión cuyo email coincida con esa variable puede entrar; cualquier otra
persona logueada es redirigida a `/`.

Cada login (vía GitHub o Google) registra o actualiza una fila en la tabla
`users` — es la única forma de saber quién usó la app sin depender de que
haya dejado alguna review.

## Insights

`/activity/insights` (pestaña dentro de Actividad) muestra rankings
calculados sobre todas las reviews de la comunidad:
- **Mejor valorado**: los cafés con mejor promedio de puntaje.
- **Le gusta a varios**: los cafés que probaron más personas distintas
  (no el más repetido por una sola persona, sino el de mayor alcance).
- **Ranking de catadores**: quién dejó más reviews, con el promedio que
  suele puntuar.
- **Con leche**: qué porcentaje de todas las reviews llevó leche, el
  promedio de puntaje con leche vs. sin leche, y los tipos de leche más
  usados.

El perfil (`/profile`) también suma una tarjeta personal: qué porcentaje
de tus propias reviews llevaron leche y cuál es el tipo que más usás.

## Ícono y PWA

El favicon y los íconos (`app/favicon.ico`, `app/icon.png`, `app/apple-icon.png`,
`public/icons/`) usan el mismo diseño de taza que el logo del header. La app
además tiene `app/manifest.ts`, lo que la hace **instalable en el celular**:
desde Chrome (Android) o Safari (iOS), la opción "Agregar a pantalla de
inicio" la instala con ícono propio y sin la barra del navegador (modo
`standalone`).

Además, `app/components/InstallPrompt.tsx` muestra un banner sugiriendo
instalarla, **solo en mobile** y solo si todavía no está instalada:
- En Android/Chrome, dispara el diálogo nativo de instalación (evento
  `beforeinstallprompt`).
- En iOS, como Apple no expone ninguna API para instalar programáticamente,
  muestra instrucciones ("Tocá Compartir → Agregar a inicio").
- En desktop no aparece nunca.
- Se puede cerrar, y no vuelve a insistir en ese dispositivo (`localStorage`).

## Notificaciones push

Desde el dropdown del avatar (usuario logueado), "Activar notificaciones"
suscribe ese dispositivo. Además, la primera vez que alguien entra logueado
(y todavía no decidió nada sobre notificaciones en ese navegador), aparece
un banner abajo a la derecha preguntando directamente si las quiere activar
(`app/components/NotificationPrompt.tsx`) — no hace falta ir a buscarlo al
menú. El banner no vuelve a aparecer una vez que la persona elige "Sí,
activar" o "Ahora no" (se guarda en `localStorage`, por dispositivo), ni si
el navegador ya tiene una decisión tomada de antes (permiso concedido o
rechazado).

A partir de ahí, cada vez que alguien carga una review nueva, todos los
demás dispositivos suscriptos reciben un push tipo "Fulano cató Doré — 07",
incluso con la app cerrada.

**Cómo configurarlo:**

1. Generá tu propio par de claves (no reutilices las de ejemplo en producción):
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Cargá en `.env.local` y en Vercel:
   ```
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<Public Key>
   VAPID_PRIVATE_KEY=<Private Key>
   VAPID_SUBJECT=mailto:tu-email@ejemplo.com
   ```
3. Corré la migración [`db/migrations/006_push_subscriptions.sql`](./db/migrations/006_push_subscriptions.sql)
   (crea la tabla `push_subscriptions`).

**Limitaciones a tener en cuenta:**
- En iPhone, solo funciona si la persona **instaló** la app a la pantalla
  de inicio (no alcanza con tenerla abierta en Safari), y necesita iOS 16.4+.
- En Android/Chrome funciona directo, instalada o no.
- Si el navegador no soporta push, el botón de notificaciones directamente
  no aparece (en vez de mostrar un error).

## Feed (actividad de todos tus grupos, un solo clic)

`/feed` reemplazó a la vieja pantalla de "Grupos" en el menú. Tiene dos partes:

- **Carrusel de grupos** arriba: tarjeta con foto, nombre y avatares de los
  miembros de cada grupo tuyo. Tocar una te lleva a `/groups/[id]` (ahí
  siguen viviendo el link de invitación, la lista completa de miembros,
  y las pestañas Actividad/Insights de ESE grupo puntual).
- **Feed combinado** abajo: todas las reviews de gente con la que compartís
  **algún** grupo (no solo uno), en orden cronológico, con la tarjeta
  completa (info + las 3 imágenes).

La vieja ruta `/groups` (el listado simple que había antes) ahora
redirige a `/feed`, para no romper links guardados.

**Adentro de un grupo puntual**, unifiqué lo que antes eran dos pestañas
casi idénticas (Actividad mostraba una lista compacta, Reviews mostraba
las mismas reviews como tarjetas) en una sola: Actividad ahora muestra
las tarjetas completas directamente. Quedó: **Actividad | Insights**.

## Grupos (privacidad)

Un grupo **no es un contenedor de reviews** — es un círculo de visibilidad.
Las reviews siguen siendo simplemente de quien las carga, sin importar
cuándo. Lo que un grupo controla es *quién puede ver a quién*: al compartir
un grupo con alguien, ves **todo** su historial (pasado, presente y
futuro), no solo lo que cargó después de que el grupo existiera.

- Cualquiera puede **crear un grupo** (`/groups/new`): nombre y, opcional,
  una foto (por ahora se pega un link a una imagen, no hay subida de
  archivos — eso queda para más adelante).
- Cada grupo tiene un **link de invitación** único
  (`/groups/join/[código]`). Cualquiera que entre a ese link y se loguee
  queda adentro.
- **Cualquier miembro** puede editar el nombre y la foto del grupo, no
  solo quien lo creó.
- **Cargar una review no tiene nada que ver con los grupos**: el form es
  el mismo de siempre, sin elegir nada. Los grupos solo deciden quién
  puede ver esa review después.
- Dentro de un grupo podés ver el **perfil de cualquier otro miembro**
  (`/groups/[id]/members/[email]`) con **todo** su historial — incluidas
  reviews de antes de que se creara el grupo o de que se unieran.
- `/groups/[id]/activity`, `/insights` y `/reviews` muestran la actividad
  combinada de todos los miembros actuales del grupo (todo lo que cada uno
  haya catado alguna vez, no solo desde que están en el grupo).
- Las notificaciones push avisan a cualquiera que comparta **algún** grupo
  con quien cargó la review (sin importar cuál).

**Reviews de antes de esta feature:** la migración `009_groups.sql` no
las toca — arma un grupo llamado "Café original" y agrega como miembros a
todos los que ya habían dejado alguna review, para que sigan viéndose entre
ellos como antes de que existieran los grupos.

## Lugar de compra

En la sección "Lugar" del form podés elegir si tomaste el café **ahí mismo**
o **en tu casa**. Si elegís "ahí", escribís el nombre del lugar a mano (texto
libre, sin buscador ni mapa). Se guarda y se muestra en las reviews y en el
perfil de cada persona como "Lugares visitados", cada uno con un link que
abre una búsqueda de ese nombre en Google Maps.

**Cero configuración, cero costo, cero cosas que se puedan romper** — no
hay API de por medio, es solo texto y un link de búsqueda armado con el
propio nombre que escribiste. (Antes probamos con Google Places y con
OpenStreetMap/Leaflet, pero terminamos optando por esto: es lo único que
no depende de un servicio externo para funcionar.)

Solo hay que correr la migración:
```
db/migrations/010_place_visited.sql
```

Si en algún momento corriste una versión anterior de esa migración (la que
incluía coordenadas y place_id, de cuando probamos con mapas), podés limpiar
esas columnas que quedaron sin uso corriendo, opcionalmente:
```
db/migrations/011_cleanup_place_columns.sql
```

## Preparar tu café (calculadora)

`/brew` es una sección aparte, sin login ni base de datos de por medio —
pura calculadora. Elegís el método (por ahora solo **Prensa francesa**
está activa, el resto dice "Pronto") y ajustás:

- **Intensidad** (Suave → Fuerte): cambia la proporción café/agua (de 1:17
  a 1:12) y el tiempo de reposo (3 a 5 minutos).
- **Cantidad de tazas**: contador simple (+/-), asumiendo 200ml por taza.
- **¿Ya está molido?**: si decís que sí, el paso a paso se salta la parte
  de moler y te dice directamente cuánto usar de tu café ya molido.
- **Tamaño de tu prensa**: los tamaños comerciales más comunes (350, 600,
  800, 1000, 1500 ml) más un campo para poner una medida distinta. Si
  pediste más tazas de las que entran en una sola tanda, te avisa cuántas
  tandas necesitás y te da la receta por tanda, no el total imposible de
  meter de una.

También hay un botón de info (ícono "i") al lado de la temperatura que
explica qué pasa si el agua está más caliente o más fría que la
recomendada.

Los tamaños de prensa los saqué de mi conocimiento general, no navegando
sitios de venta en el momento (mi acceso a internet acá está limitado a
unos pocos dominios técnicos).

**Inventario de prensas:** en vez de elegir una sola prensa, ahora ponés
cuántas tenés de cada tamaño (podés tener, por ejemplo, una de 350ml y
otra de 600ml a la vez). El cálculo reparte el agua total entre todas tus
prensas disponibles y te dice exactamente cuánta agua y cuánto café va en
**cada una**. Si entre todas no alcanza para la cantidad de tazas pedida,
te arma "tandas" (usa todas tus prensas juntas, y si hace falta, repite).

## Selector de café (pantalla completa, dos pasos)

El selector de café en el formulario ya no es un dropdown chiquito — al
tocarlo se abre una pantalla completa (`app/components/CoffeeSelector.tsx`)
con dos pasos:

1. **Marca**: tarjetas con logo (si la marca tiene uno cargado) o un
   ícono genérico, filtrables con el buscador de arriba.
2. **Línea**: al tocar una marca, lista de sus líneas/tipos.

En cualquiera de los dos pasos hay un botón para **agregar un café nuevo**
(si venís de una marca, ya te la precarga). El formulario de creación
ahora también tiene un campo de **Notas** opcional.

De paso arreglamos algo que rompía bastante en mobile: los inputs tenían
el texto en 14.4px, y **por debajo de 16px, iOS/Android hacen zoom
automático al enfocar un campo** — molestísimo en un buscador. Subimos
`.input-field` a 16px fijo en `app/globals.css`.

## Panel de admin: catálogo de cafés

`/admin/coffees` (protegido por `ADMIN_EMAIL`, igual que `/admin/users`)
tiene dos secciones:

- **Logos de marca**: un input por marca para pegar el link de una imagen.
  Se guarda en la tabla `brand_logos` y se usa en el selector de café.
- **Cafés**: lista completa, cada uno linkea a `/admin/coffees/[id]` para
  editar cualquier campo (marca, línea, origen, finca, variedad, proceso,
  notas).

## Estructura

- `app/feed/page.tsx` — carrusel de grupos + actividad combinada de todos
- `app/groups/page.tsx` — redirect a `/feed` (ruta vieja, se mantiene por compatibilidad)
- `app/page.tsx` — formulario principal (pide login si no hay sesión)
- `app/groups/new/page.tsx` — crear un grupo
- `app/groups/[groupId]/page.tsx` — home del grupo: header editable, miembros
- `app/groups/[groupId]/activity/page.tsx` — feed cronológico del grupo
- `app/groups/[groupId]/activity/[id]/page.tsx` — detalle de una review
- `app/groups/[groupId]/insights/page.tsx` — rankings del grupo
- `app/groups/[groupId]/reviews/page.tsx` — archivo de reviews del grupo
- `app/groups/[groupId]/members/[email]/page.tsx` — perfil de un miembro, acotado a ese grupo
- `app/groups/join/[code]/page.tsx` — pantalla de invitación
- `app/reviews/[id]/edit/page.tsx` — edición de una review (solo el dueño, sin importar el grupo)
- `app/profile/page.tsx` — tus propias reviews en todos tus grupos, insights y calendario
- `app/admin/coffees/page.tsx` — logos de marca + listado editable de cafés
- `app/admin/coffees/[id]/page.tsx` — edición de un café puntual
- `app/components/BrandLogoRow.tsx` — fila para editar el logo de una marca
- `app/components/EditCoffeeForm.tsx` — formulario de edición de un café
- `app/admin/users/page.tsx` — lista de usuarios registrados (protegida por `ADMIN_EMAIL`)
- `app/api/groups/route.ts` — listar mis grupos / crear uno
- `app/api/groups/[id]/route.ts` — editar nombre/foto de un grupo
- `app/api/groups/join/[code]/route.ts` — unirse por código de invitación
- `app/api/reviews/route.ts` — crear una review (valida membresía al grupo)
- `app/api/reviews/[id]/route.ts` — editar/eliminar una review propia
- `app/api/coffees/route.ts` — API route que lista y crea cafés del catálogo
- `app/api/auth/[...nextauth]/route.ts` — endpoints de NextAuth
- `app/components/GroupHeader.tsx` — nombre/foto del grupo, editable por cualquier miembro
- `app/components/GroupTabs.tsx` — pestañas Actividad / Insights / Reviews dentro de un grupo
- `app/components/JoinGroupButton.tsx` — botón de unirse (o loguearse primero)
- `app/components/ReviewFormFields.tsx` — campos del form, compartidos entre crear y editar
- `app/components/EditReviewForm.tsx` — wrapper de edición sobre ReviewFormFields
- `app/components/CoffeeSelector.tsx` — buscador/creador de cafés del catálogo
- `app/components/ActivityHeatmap.tsx` — calendario de actividad estilo GitHub
- `app/components/StarRating.tsx` — rating en 5 estrellas (a partir de la escala 1-10)
- `app/components/UserMenu.tsx` — avatar + dropdown de login/logout
- `app/components/Header.tsx` — header compartido en todas las páginas
- `app/components/AuthProvider.tsx` — wrapper del SessionProvider
- `app/components/NotificationPrompt.tsx` — banner que pregunta por activar notificaciones la primera vez
- `app/components/InstallPrompt.tsx` — banner que sugiere instalar la app, solo en mobile
- `app/components/ReviewCard.tsx` — tarjeta de review (info + las 3 imágenes), reutilizada en el Feed, Actividad de grupo y perfiles
- `lib/auth.ts` — configuración de NextAuth (providers, callbacks, registro de logins)
- `lib/db.ts` — cliente de conexión a Neon y tipos
- `lib/push.ts` — envío de notificaciones push a conexiones compartidas (mismo grupo)
- `lib/constants.ts` — etiquetas compartidas (tueste, proceso, temperatura)
- `lib/formatRelativeTime.ts` — formateo de fechas relativas ("hace 2 horas")
- 
- `app/brew/page.tsx` — selector de método de preparación
- `app/components/FrenchPressCalculator.tsx` — calculadora de prensa francesa
- `db/schema.sql` — script para crear las tablas desde cero
- `db/migrations/` — migraciones incrementales, correr en orden si ya tenías datos
