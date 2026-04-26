# Nebrija Social – Práctica 4

Esto es un clon de Twitter hecho con Next.js 16 y Tailwind CSS.


## Instalación y arranque


- npm install
- npm run dev


Abre (http://localhost:3000) en el navegador.

## Estructura de navegación

En la app usa App Router de Next.js con las siguientes rutas : 

- Login y registro (toggle entre formularios) |
- Timeline global con paginación |
- Detalle de un post con comentarios |
- Perfil de usuario con sus posts |

### Protección de rutas

En el proxy.ts actua como middleware de Next.js, lo que hace es que lee la cookie/ token, en las peticiones y lleva al usuario al login, si no se ha autenticado. Pero si tiene el token lo redirige a la home.


### Autenticación


El token JWT se guarda en una cookie accesible desde JavaScript token.
Aparte userId y username, en cookies y asi se muestra el avatar del usuario en la cabecera y ver el perfil propio.


## Datos anidados de la API

La API devuelve objetos anidados:

- **`post.autor`**  `{ _id, username }`
- **`post.likes`**  array de IDs de usuario.
- **`post.retweets`**  array de `{ usuario, fecha }`. 
- **`post.comentarios`**  array de `{ _id, contenido, autor, fecha }` 
- **`user.seguidores`**  array de IDs. 

Todos los endpoints autenticados envían los headers `Authorization: Bearer <token>` y `x-nombre, de una maenra centralizada.