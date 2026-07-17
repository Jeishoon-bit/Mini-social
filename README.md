# Mini Social

<p align="center">
  <img src="public/logo.svg" alt="Mini Social Logo" width="64" height="64">
  <br>
  <strong>Red social minimalista</strong>
</p>

<p align="center">
  Una red social ligera y moderna para conectar con personas.
  Construida con Next.js, Tailwind CSS, shadcn/ui, Prisma y SQLite.
</p>

---

## ✨ Características

- **Autenticación** — Registro e inicio de sesión con email y contraseña.
- **Feed global** — Publicaciones de todos los usuarios ordenadas por fecha (estilo Twitter/X).
- **Likes** — Dar/quitar like en publicaciones con contador en tiempo real.
- **Follows** — Seguir y dejar de seguir usuarios con un solo clic.
- **Perfiles** — Avatar, nombre, biografía y estadísticas (posts, seguidores, seguidos).
- **Búsqueda** — Buscar usuarios por nombre desde la barra de navegación.
- **Edición de perfil** — Cambiar nombre, biografía y avatar (carga en base64).
- **UI limpia** — Diseño minimalista con tipografía Inter, bordes suaves y mucho espacio en blanco.

## 🛠 Stack tecnológico

| Categoría | Tecnología |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 4 + shadcn/ui |
| Base de datos | SQLite (local) |
| ORM | Prisma ORM |
| Autenticación | NextAuth.js v4 (Credentials + JWT) |
| Hashing | bcryptjs |
| Estado cliente | Zustand |
| Íconos | Lucide React |

## 📁 Estructura del proyecto

```
mini-social/
├── public/
│   ├── logo.svg              # Logo SVG de la app
│   └── robots.txt
├── prisma/
│   └── schema.prisma         # Modelo de datos (User, Post, Like, Follow)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts  # NextAuth endpoints
│   │   │   │   └── register/route.ts       # Registro de usuarios
│   │   │   ├── posts/
│   │   │   │   ├── route.ts                # GET (feed), POST (crear)
│   │   │   │   └── [id]/route.ts           # GET, PUT, DELETE
│   │   │   ├── likes/route.ts              # Toggle like
│   │   │   ├── follows/route.ts            # Toggle follow
│   │   │   ├── profile/route.ts            # GET, PUT perfil propio
│   │   │   └── users/
│   │   │       ├── search/route.ts         # Búsqueda por nombre
│   │   │       └── [id]/route.ts           # Perfil de otro usuario
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx              # SPA principal (router cliente)
│   ├── components/
│   │   ├── ui/                   # Componentes shadcn/ui
│   │   ├── AuthProvider.tsx      # Wrapper de NextAuth SessionProvider
│   │   ├── Logo.tsx              # Logo SVG con props personalizables
│   │   ├── Navbar.tsx            # Barra de navegación superior
│   │   ├── PostCard.tsx          # Tarjeta de publicación
│   │   ├── PostInput.tsx         # Input para crear post
│   │   ├── FeedView.tsx          # Vista del feed global
│   │   ├── ProfileView.tsx       # Vista de perfil propio
│   │   ├── UserView.tsx          # Vista de perfil ajeno
│   │   ├── SearchView.tsx        # Vista de resultados de búsqueda
│   │   ├── LoginView.tsx         # Vista de inicio de sesión
│   │   ├── RegisterView.tsx      # Vista de registro
│   │   └── EditProfileDialog.tsx # Diálogo para editar perfil
│   ├── hooks/
│   ├── lib/
│   │   ├── auth.ts              # Configuración de NextAuth
│   │   ├── db.ts                # Cliente Prisma (SQLite)
│   │   ├── store.ts             # Zustand store (routing SPA)
│   │   └── utils.ts             # Utilidades generales
│   └── types/
│       └── next-auth.d.ts       # Extensiones de tipo de NextAuth
├── .env.example                 # Template de variables de entorno
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
└── components.json              # Configuración de shadcn/ui
```

## 🚀 Instalación

### Requisitos previos

- **Node.js** >= 18
- **npm**, **bun** o **yarn**

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Jeishoon-bit/Mini-social.git
cd mini-social

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env y cambia NEXTAUTH_SECRET por un valor seguro

# 4. Generar cliente de Prisma y crear la base de datos
npx prisma generate
npx prisma db push

# 5. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en **http://localhost:3000**.

### Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo en puerto 3000 |
| `npm run build` | Build de producción |
| `npm run start` | Iniciar servidor de producción |
| `npm run lint` | Ejecutar ESLint |
| `npm run db:generate` | Generar cliente Prisma |
| `npm run db:push` | Sincronizar schema con la base de datos |
| `npm run db:migrate` | Ejecutar migraciones |

## 🗄 Modelo de datos

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │────<│   Post   │────<│   Like   │
│          │     │          │     │          │
│ id       │     │ id       │     │ id       │
│ email    │     │ userId   │     │ userId   │
│ name     │     │ content  │     │ postId   │
│ password │     │ createdAt│     │ createdAt│
│ bio      │     │ updatedAt│     └──────────┘
│ avatarUrl│     └──────────┘
│ createdAt│
│ updatedAt│     ┌──────────────┐
└────┬─────┘     │    Follow    │
     │           │              │
     ├──────────<│ followerId   │
     │           │ followingId  │
     └──────────<│ createdAt    │
                 └──────────────┘
```

- **User** — Usuarios con email único, nombre, biografía y avatar.
- **Post** — Publicaciones vinculadas a un usuario. Máximo 500 caracteres.
- **Like** — Un usuario solo puede dar like una vez por post (restricción única).
- **Follow** — Relación de seguidores. Un usuario no puede seguirse a sí mismo (restricción única).

## 🔐 Autenticación

La autenticación usa **NextAuth.js** con la estrategia Credentials y JWT:

- Las contraseñas se almacenan hasheadas con **bcryptjs** (12 rounds).
- El token JWT incluye el `id` del usuario.
- Todas las rutas API verifican la sesión y devuelven `401` si no hay usuario autenticado.
- El `NEXTAUTH_SECRET` debe ser un string seguro en producción.

## 🎨 Diseño

- **Tipografía**: Inter (Google Fonts)
- **Color primario**: `#3b82f6` (azul)
- **Bordes**: `rounded-2xl` para todos los contenedores
- **Tema**: Modo claro con fondo `#fafafa`
- **Logo**: SVG minimalista incluido en `src/components/Logo.tsx`, acepta props de `width`, `height` y `color`

## 📄 Licencia

MIT License — ver archivo [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuir

1. Haz un **fork** del repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nombre`
3. Haz **commit** de tus cambios: `git commit -m 'feat: descripción'`
4. Haz **push** a la rama: `git push origin feature/nombre`
5. Abre un **Pull Request`

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para más detalles.
