# Guia de transicion a arquitectura por features

Documento de referencia para el panel admin (`Foodstore-admin_app`) despues de reorganizar el codigo fuente.

---

## Que se hizo y para que sirve esta guia

El proyecto paso de una estructura **por tipo de archivo** (todo el `api` junto, todas las `pages` juntas, todos los `types` juntos) a una estructura **por dominio de negocio** (cada modulo del panel con lo suyo: pantallas, servicios, tipos y hooks en un mismo lugar).

**No se cambio la logica de la aplicacion**: login, roles, CRUD de catalogo, pedidos y usuarios siguen funcionando igual. Lo que cambio es **donde vive cada pieza** y como se importa (alias `@/` hacia `src/`).

Esta guia sirve para:

- Entender **por que** existe cada carpeta nueva.
- Saber **donde agregar** codigo cuando sumes una pantalla o un endpoint.
- Evitar volver a crear carpetas viejas (`src/pages`, `src/api`, etc.).
- Ubicar archivos del proyecto anterior usando las tablas de equivalencia mas abajo.

---

## Idea general: cuatro capas

El codigo bajo `src/` se organiza en cuatro bloques con responsabilidades distintas:

| Capa | Carpeta | Rol |
|------|---------|-----|
| Arranque | `app/` | Punto de entrada de React y envoltorio global (router, sesion, React Query). |
| Navegacion | `router/` | Definicion de rutas URL y que pantalla muestra cada path. |
| Compartido | `shared/` | Lo que usan **varios** modulos: cliente HTTP, navbar, rutas protegidas, utilidades. |
| Negocio | `features/` | Cada **funcionalidad del panel** aislada: auth, catalogo, pedidos, usuarios, perfil. |

Flujo simplificado al abrir la app:

1. `index.html` carga `app/main.tsx`.
2. `main.tsx` monta `App` con React Query.
3. `App` restaura la sesion (`auth`) y envuelve todo en `BrowserRouter`.
4. `router/AppRouter` decide la pantalla segun la URL y los roles.
5. Cada pantalla en `features/.../pages` usa hooks y servicios de **su** feature para hablar con el backend.

---

## Sentido de cada carpeta principal

### `src/app/`

Es el **corazon de arranque** de la aplicacion, no una pantalla de usuario.

- **`main.tsx`**: crea la raiz de React, importa estilos globales y configura `QueryClientProvider` (TanStack Query para cache y refetch de datos).
- **`App.tsx`**: monta el router y dispara `loadUser()` al iniciar para saber si hay sesion activa (cookie HttpOnly + `/me`).

Todo lo demas cuelga de aca; por eso `index.html` apunta a `/src/app/main.tsx` y no a un `main.tsx` suelto en la raiz de `src/`.

### `src/router/`

Concentra **que URLs existen** y que componente se renderiza en cada una.

- **`AppRouter.tsx`**: rutas publicas (`/login`), rutas del panel con `NavBar`, rutas anidadas con restriccion de rol (pedidos solo `ADMIN`/`PEDIDOS`, usuarios solo `ADMIN`).

La logica de “¿puede entrar este usuario?” no va aca: eso esta en `shared/routes/ProtectedRoute.tsx`. El router solo **arma el mapa de pantallas**.

### `src/shared/`

Codigo **reutilizable entre features**, sin pertenecer a un solo modulo de negocio.

| Subcarpeta | Contenido | Cuando usarla |
|------------|-----------|---------------|
| `api/` | `client.ts` — instancia Axios (`baseURL`, cookies, interceptores) | Todos los servicios importan `api` desde aca; no duplicar clientes. |
| `components/` | UI transversal (`NavBar`, `StockBadge`) | Componentes que aparecen en mas de un modulo o en todo el layout. |
| `routes/` | `ProtectedRoute` — redireccion si no hay sesion o rol | Envolver pantallas o secciones que requieren autenticacion. |
| `hooks/` | Utilidades genericas (`useForm`) | Hooks que no son de un dominio concreto. |

En desarrollo, `client.ts` usa `VITE_API_BASE=/backend` (ver `.env.development`) para que Vite haga proxy al backend y evitar problemas de CORS.

### `src/features/`

Cada carpeta es un **modulo del panel** con todo lo necesario para esa parte del negocio. La convencion interna se repite:

```
features/<nombre>/
  api/          # llamadas HTTP al backend (servicios)
  hooks/        # useQuery, useMutation, estado de pantalla
  pages/        # componentes de ruta (pantallas completas)
  types/        # interfaces TypeScript del dominio
  store/        # solo si hay estado global de ese modulo (ej. auth)
  components/   # solo UI de ese modulo (modales, tablas locales)
```

| Feature | Que agrupa |
|---------|------------|
| `auth/` | Login, logout, sesion Zustand, tipos de usuario y roles. |
| `profile/` | Pantalla de perfil del usuario logueado. |
| `catalog/products/` | Listado, detalle, alta/edicion y stock de productos. |
| `catalog/categories/` | Arbol y CRUD de categorias. |
| `catalog/ingredients/` | Listado y CRUD de ingredientes. |
| `orders/` | Tablero de pedidos y cambio de estado. |
| `admin-users/` | Gestion de usuarios del sistema (TanStack Table). |

**Por que `catalog/` agrupa tres subcarpetas:** productos, categorias e ingredientes son dominios distintos pero del mismo “mundo” del menu; comparten conceptos (un producto tiene categorias e ingredientes). Separarlos en `catalog/products`, `catalog/categories`, etc. evita una carpeta `features/products` gigante y mantiene cada subdominio con su `api`, `hooks` y `pages`.

### `src/index.css`

Estilos globales (Tailwind). No es parte de la arquitectura por features, pero vive al lado de `app/` como recurso de toda la app.

### Imports: alias `@/`

Cualquier archivo puede importar con `@/features/...` o `@/shared/...` en lugar de rutas relativas largas (`../../../`). El alias apunta a `src/` (configurado en `vite.config.ts` y `tsconfig.app.json`).

---

## Antes vs despues

| Antes (legacy) | Despues (actual) |
|---|---|
| `src/main.tsx` + `src/App.tsx` | `src/app/main.tsx` + `src/app/App.tsx` |
| `src/api/*` | `src/shared/api/client.ts` + `src/features/<dominio>/api/*` |
| `src/pages/*` | `src/features/<dominio>/pages/*` |
| `src/components/*` | `src/shared/components/*` y `src/features/catalog/*/components/*` |
| `src/types/*` | `src/features/<dominio>/types/*` |
| `src/store/auth.store.ts` | `src/features/auth/store/auth.store.ts` |
| `src/routes/*` | `src/router/AppRouter.tsx` + `src/shared/routes/ProtectedRoute.tsx` |
| `src/hooks/useForm.ts` | `src/shared/hooks/useForm.ts` |

## Arbol objetivo (fuente unica)

```
src/
  app/
    main.tsx          # entry (index.html apunta aca)
    App.tsx           # BrowserRouter + carga de sesion
  router/
    AppRouter.tsx     # rutas y anidado por rol
  shared/
    api/client.ts     # axios: baseURL, withCredentials, interceptor
    components/NavBar/
    components/StockBadge/
    routes/ProtectedRoute.tsx
    hooks/useForm.ts
  features/
    auth/             # login, store, IUser, auth.service
    profile/          # UserPage + useProfile
    catalog/
      products/       # listado, detalle, modal, stock
      categories/
      ingredients/
    orders/
    admin-users/
  index.css
```

Alias de imports: `@/` → `src/` (ver `vite.config.ts` y `tsconfig.app.json`).

## Mapa legacy → nuevo (servicios y tipos)

| Archivo viejo | Archivo nuevo |
|---|---|
| `src/api/api.ts` | `src/shared/api/client.ts` |
| `src/api/auth.service.ts` | `src/features/auth/api/auth.service.ts` |
| `src/store/auth.store.ts` | `src/features/auth/store/auth.store.ts` |
| `src/types/IUser.ts` | `src/features/auth/types/IUser.ts` |
| `src/api/product.service.ts` | `src/features/catalog/products/api/product.service.ts` |
| `src/types/IProduct.ts` | `src/features/catalog/products/types/IProduct.ts` |
| `src/api/categories.service.ts` | `src/features/catalog/categories/api/categories.service.ts` |
| `src/types/ICategorie.ts` | `src/features/catalog/categories/types/ICategorie.ts` |
| `src/api/ingredients.service.ts` | `src/features/catalog/ingredients/api/ingredients.service.ts` |
| `src/types/IIngredient.ts` | `src/features/catalog/ingredients/types/IIngredient.ts` |
| `src/api/orders.service.ts` | `src/features/orders/api/orders.service.ts` |
| `src/types/IOrder.ts` | `src/features/orders/types/IOrder.ts` |
| `src/api/admin-users.service.ts` | `src/features/admin-users/api/admin-users.service.ts` |
| `src/types/IAdminUser.ts` | `src/features/admin-users/types/IAdminUser.ts` |
| `src/components/NavBar/NavBar.tsx` | `src/shared/components/NavBar/NavBar.tsx` |
| `src/components/StockBadge/StockBadge.tsx` | `src/shared/components/StockBadge/StockBadge.tsx` |

## Equivalencia paginas y rutas

| Pagina legacy | Pagina nueva | Ruta |
|---|---|---|
| `src/pages/LoginPage.tsx` | `src/features/auth/pages/LoginPage.tsx` | `/login` |
| `src/pages/ProductsPage.tsx` | `src/features/catalog/products/pages/ProductsPage.tsx` | `/` |
| `src/pages/ProductDetailPage.tsx` | `src/features/catalog/products/pages/ProductDetailPage.tsx` | `/products/:id` |
| `src/pages/CategoryPage.tsx` | `src/features/catalog/categories/pages/CategoryPage.tsx` | `/categories` |
| `src/pages/IngredientsPage.tsx` | `src/features/catalog/ingredients/pages/IngredientsPage.tsx` | `/ingredients` |
| `src/pages/UserPage.tsx` | `src/features/profile/pages/UserPage.tsx` | `/profile` |
| `src/pages/OrdersPage.tsx` | `src/features/orders/pages/OrdersPage.tsx` | `/orders` |
| `src/pages/AdminUsersPage.tsx` | `src/features/admin-users/pages/AdminUsersPage.tsx` | `/users` |
| `src/routes/AppRouter.tsx` | `src/router/AppRouter.tsx` | — |
| `src/routes/ProtectedRoute.tsx` | `src/shared/routes/ProtectedRoute.tsx` | — |

## Donde quedaron las acciones clave

| Responsabilidad | Ubicacion |
|---|---|
| Login, logout, `/me`, cookie HttpOnly | `src/features/auth/store/auth.store.ts` + `auth.service.ts` |
| Rutas protegidas y roles (`ADMIN`, `STOCK`, `PEDIDOS`) | `src/shared/routes/ProtectedRoute.tsx` + `src/router/AppRouter.tsx` |
| Listado/CRUD productos y stock | `src/features/catalog/products/hooks/useProductsData.ts` |
| Detalle de producto | `src/features/catalog/products/hooks/useProductDetail.ts` |
| Categorias | `src/features/catalog/categories/hooks/useCategoriesData.ts` |
| Ingredientes | `src/features/catalog/ingredients/hooks/useIngredientsData.ts` |
| Tablero de pedidos y cambio de estado | `src/features/orders/hooks/useOrdersBoard.ts` |
| Usuarios admin (TanStack Table) | `src/features/admin-users/hooks/useAdminUsers.ts` |
| Perfil del usuario logueado | `src/features/profile/hooks/useProfile.ts` |
| Formulario reutilizable (login, etc.) | `src/shared/hooks/useForm.ts` |
| Badge visual de stock (sin logica de negocio) | `src/shared/components/StockBadge/StockBadge.tsx` |

Los hooks concentran `useQuery` / `useMutation` / `invalidateQueries` que antes vivian en las paginas; el comportamiento de la app no cambia.

## Checklist anti-legacy

- [ ] No crear carpetas `src/api`, `src/pages`, `src/types`, `src/store` ni `src/routes`.
- [ ] No duplicar features en `src/features/products` sueltas: el catalogo va bajo `src/features/catalog/`.
- [ ] Servicios nuevos solo en `src/features/<dominio>/api/`.
- [ ] Tipos nuevos solo en `src/features/<dominio>/types/`.
- [ ] Componentes compartidos entre modulos → `src/shared/components/`.
- [ ] Componentes solo de un subdominio → dentro de ese feature (ej. modales de catalogo).
- [ ] Imports internos con alias `@/`, nunca rutas relativas largas hacia carpetas borradas.
- [ ] Entry point unico: `index.html` → `/src/app/main.tsx`.
- [ ] Tras cambios estructurales: `pnpm run build` y smoke con `pnpm run dev`.

## Verificacion rapida

```bash
pnpm install
pnpm run build
pnpm run dev
```

Si el build falla por imports a `@/pages/*` o `@/App`, quedaron archivos huérfanos de una migracion parcial: eliminarlos y usar solo el arbol de esta guia.
