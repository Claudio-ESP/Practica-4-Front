# Nebrija Social – Práctica 4

Clon funcional de Twitter construido con Next.js 16 y Tailwind CSS.

## Instalación y arranque

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Estructura de navegación

La app usa el **App Router** de Next.js con las siguientes rutas:

| Ruta | Página |
|------|--------|
| `/login` | Login y registro (toggle entre formularios) |
| `/` | Timeline global con paginación |
| `/post/[id]` | Detalle de un post con comentarios |
| `/profile/[id]` | Perfil de usuario con sus posts |

### Protección de rutas

El fichero `proxy.ts` actúa como middleware de Next.js: lee la cookie `token` en cada petición y redirige al usuario a `/login` si no está autenticado. Si ya tiene token y visita `/login`, lo redirige a la home.

### Autenticación

El token JWT se guarda en una cookie accesible desde JavaScript (`token`). También se guardan `userId` y `username` en cookies para mostrar el avatar del usuario en la cabecera y navegar al perfil propio.

## Datos anidados de la API

La API devuelve objetos anidados:

- **`post.autor`** → `{ _id, username }` — se usa el `_id` para enlazar al perfil y la inicial del `username` para el avatar.
- **`post.likes`** → array de IDs de usuario. Se compara con el `userId` en cookie para saber si el usuario actual ya dio like.
- **`post.retweets`** → array de `{ usuario, fecha }`. Se filtra por `retweet.usuario === userId` para detectar si el usuario ya hizo retweet.
- **`post.comentarios`** → array de `{ _id, contenido, autor, fecha }` con el autor también anidado.
- **`user.seguidores`** → array de IDs. Si el `userId` propio aparece aquí, el usuario está siendo seguido.

Todos los endpoints autenticados envían los headers `Authorization: Bearer <token>` y `x-nombre: Claudia Murci` de forma centralizada desde `lib/api.ts`.
