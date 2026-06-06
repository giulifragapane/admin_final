# Admin-App Frontend: Flujo Completo y Responsabilidades

Este documento explica el funcionamiento general del frontend de administración (`admin-app`) con foco en:

- Flujo de datos desde login hasta acciones de gestión.
- Restricción por autenticación y roles.
- Responsabilidad de cada archivo principal, y de sus funciones exportadas.
- Cómo viajan las acciones del Admin al backend y cómo se refleja la respuesta.

No es una explicación línea por línea: es una guía de arquitectura y flujo.

---

## 1) Visión general de arquitectura

La app está organizada por capas:

- `api/`: comunicación HTTP con backend (Axios + funciones por módulo).
- `store/`: estado global de sesión/autorización (Zustand).
- `routes/`: navegación y guardas de acceso por autenticación/rol.
- `pages/`: pantallas que consumen estado de servidor (TanStack Query) y renderizan UI.
- `components/`: piezas reutilizables (navbar, modales, badges).
- `types/`: contratos TypeScript del dominio.

Tecnologías clave en el flujo:

- **Axios** para requests al backend.
- **TanStack Query** para cachear/listar/mutar datos de servidor.
- **Zustand** para sesión del usuario.
- **React Router** para navegación y protección de rutas.

---

## 2) Flujo end-to-end desde que abre la app

### 2.1 Bootstrap de la app

Archivo: `src/main.tsx`

- Crea un `QueryClient`.
- Envuelve la app en `QueryClientProvider`.
- Resultado: cualquier página puede usar `useQuery` / `useMutation`.

Archivo: `src/App.tsx`

- Monta `BrowserRouter`.
- En `useEffect`, ejecuta `loadUser()` del `auth.store`.
- Resultado: al entrar (o recargar), la app intenta recuperar sesión vía cookie (`/me`) antes de decidir acceso.

---

### 2.2 Login y sesión

Archivo: `src/pages/LoginPage.tsx`

- Muestra formulario (TanStack Form).
- En submit llama `loginUser(email, password)`.
- Si éxito: navega a `/`.
- Si error: muestra mensaje amigable.

Archivo: `src/store/auth.store.ts`

Estado:

- `user`
- `isLoading`
- `isAuthenticated`

Funciones exportadas:

- `loginUser(email, password)`: usa `login()` de `auth.service`, guarda usuario autenticado.
- `loadUser()`: usa `getMe()` para restaurar sesión; si falla, limpia estado.
- `logoutUser()`: llama `logout()` y limpia sesión local.
- `hasRole(roles)`: valida permisos contra `user.roles`.

Archivo: `src/api/auth.service.ts`

Funciones:

- `login({ email, password })`: `POST /api/v1/auth/token` (form-data) y luego `GET /api/v1/auth/me`.
- `getMe()`: obtiene usuario autenticado actual.
- `logout()`: cierra sesión en backend.

Archivo: `src/api/api.ts`

- Instancia Axios única:
  - `baseURL` desde `VITE_API_URL`
  - `withCredentials: true` (cookie HttpOnly)
- Interceptor de respuesta:
  - Toma `detail` del backend si existe.
  - Rechaza con `Error` estandarizado para UI.

---

## 3) Autorización: dónde se restringe el acceso

### 3.1 Restricción de rutas

Archivo: `src/routes/ProtectedRoute.tsx`

Comportamiento:

- Si `isLoading`: muestra "Cargando sesión...".
- Si no autenticado: redirige a `/login`.
- Si autenticado pero sin rol permitido: muestra "No tenés permisos".
- Si pasa validaciones: renderiza `children`.

### 3.2 Matriz de rutas por rol

Archivo: `src/routes/AppRouter.tsx`

- Todo el bloque privado (`/*`) requiere: `ADMIN`, `STOCK` o `PEDIDOS`.
- `"/orders"` requiere: `ADMIN` o `PEDIDOS`.
- `"/users"` requiere: solo `ADMIN`.

### 3.3 Restricción visual de navegación

Archivo: `src/components/NavBar/NavBar.tsx`

- `canViewOrders = hasRole(["ADMIN", "PEDIDOS"])`
- `canViewUsers = hasRole(["ADMIN"])`
- La navbar oculta links según rol (no muestra opciones no permitidas).

### 3.4 Restricción de acciones dentro de páginas

Ejemplo en `src/pages/ProductsPage.tsx`:

- `canManageProducts = hasRole(["ADMIN"])`
- `canManageStock = hasRole(["ADMIN", "STOCK"])`

Impacto:

- Crear/editar/eliminar producto: solo ADMIN.
- Cambiar stock/disponibilidad: ADMIN o STOCK.
- Ver detalle: visible para quienes acceden al módulo.

Misma lógica en:

- `CategoryPage.tsx` (`canManageCategories`: ADMIN).
- `IngredientsPage.tsx` (`canManageIngredients`: ADMIN).

> Importante: el frontend restringe UX, pero la validación real de seguridad también la hace backend.

---

## 4) Gestión de server state (TanStack Query)

Patrón general repetido en páginas:

1. `useQuery` para listado o detalle.
2. `useMutation` para alta/edición/baja/cambio de estado.
3. `queryClient.invalidateQueries(...)` en `onSuccess` para refrescar cache.
4. Manejo de error de mutación para mostrar feedback.

Esto se ve en:

- `ProductsPage.tsx`
- `CategoryPage.tsx`
- `IngredientsPage.tsx`
- `OrdersPage.tsx`
- `AdminUsersPage.tsx`

---

## 5) Flujo funcional por módulo (de acción a respuesta)

## 5.1 Productos

Archivos clave:

- `src/pages/ProductsPage.tsx`
- `src/api/product.service.ts`
- `src/components/modals/ModalProducts/ModalProducts.tsx`
- `src/types/IProduct.ts`

Funciones en `product.service.ts`:

- `getProducts()`
- `getProductsById(id)`
- `createProduct(payload)`
- `updateProduct(id, payload)`
- `updateProductAvailability(id, { stock, available })`
- `deleteProduct(id)`

Flujo (ejemplo: crear producto):

1. Admin abre modal (`ProductModal`).
2. Página ejecuta `createMutation` con `createProduct`.
3. Service mapea frontend (`camelCase`) a backend (`snake_case`).
4. Backend responde.
5. `onSuccess` invalida `["products"]`.
6. Lista se refresca y modal se cierra.

Flujo (ejemplo: cambiar stock):

1. Admin/STOCK abre modal de stock.
2. `handleConfirmStockUpdate()` valida valor localmente.
3. Ejecuta `updateProductAvailability`.
4. Si éxito: invalida `["products"]`.
5. Si error: muestra mensaje en modal (`stockError`).

---

## 5.2 Detalle de producto

Archivo: `src/pages/ProductDetailPage.tsx`

- Toma `id` desde URL (`/products/:id`).
- Ejecuta `useQuery(["product-detail", id], getProductsById)`.
- Renderiza relaciones:
  - categorías (incluye principal),
  - ingredientes (incluye alérgeno/removible),
  - stock/disponibilidad,
  - imagen.

---

## 5.3 Categorías

Archivos:

- `src/pages/CategoryPage.tsx`
- `src/api/categories.service.ts`
- `src/components/modals/ModalCategories/ModalCategories.tsx`
- `src/components/modals/CategoryDetailModal/CategoryDetailModal.tsx`

Funciones de service:

- `getCategories()`
- `createCategory()`
- `updateCategory()`
- `deleteCategory()`

Flujo:

- `useQuery(["categories"])` trae listado.
- Mutaciones create/edit/delete invalidan `["categories"]`.
- Modal de detalle es lectura.
- Botones de edición/eliminación solo si ADMIN.

---

## 5.4 Ingredientes

Archivos:

- `src/pages/IngredientsPage.tsx`
- `src/api/ingredients.service.ts`
- `src/components/modals/ModalIngredients/ModalIngredients.tsx`

Funciones de service:

- `getIngredients()`
- `createIngredient()`
- `updateIngredient()`
- `deleteIngredient()`

Flujo:

- Igual patrón query + mutaciones + invalidación.
- Si rol no ADMIN, la tabla queda en modo lectura.

---

## 5.5 Pedidos (cajero/admin)

Archivos:

- `src/pages/OrdersPage.tsx`
- `src/api/orders.service.ts`
- `src/types/IOrder.ts`

Funciones de service:

- `getOrders()` → `GET /api/v1/pedidos/`
- `updateOrderStatus(id, estado)` → `PATCH /api/v1/pedidos/{id}/estado`

Flujo detallado: cambiar estado de un pedido

1. `useQuery(["orders"])` obtiene pedidos.
2. Página agrupa por estado (`PENDIENTE`, `CONFIRMADO`, `EN_PREP`, etc.).
3. Usuario elige nuevo estado en `<select>`.
4. Click en "Actualizar" llama `updateStatusMutation`.
5. `mutationFn` ejecuta `updateOrderStatus(id, estado)`.
6. Si éxito:
   - `invalidateQueries(["orders"])`
   - se recarga tablero con estado actualizado.
7. Si backend rechaza transición:
   - error del interceptor llega como `Error.message`
   - se guarda en `errorByOrder[id]`
   - se muestra bajo la tarjeta en rojo.

Relaciones mostradas en UI:

- detalle del pedido (`cantidad`, `producto_nombre`, `subtotal`)
- forma de pago
- total

---

## 5.6 Administración de usuarios

Archivos:

- `src/pages/AdminUsersPage.tsx`
- `src/api/admin-users.service.ts`
- `src/types/IAdminUser.ts`
- `src/types/IUser.ts`

Funciones de service:

- `getAdminUsers(rol?)`
- `updateAdminUser(id, data)`
- `updateAdminUserRoles(id, roles)`
- `deleteAdminUser(id)`

Flujo:

1. `useQuery(["admin-users", selectedRoleFilter])` carga usuarios (y filtra por rol si aplica).
2. Tabla se arma con TanStack Table.
3. Al editar:
   - valida campos obligatorios y que haya al menos 1 rol.
   - ejecuta `updateAdminUser`.
   - ejecuta `updateAdminUserRoles`.
   - invalida `["admin-users"]`.
4. Al eliminar:
   - `deleteAdminUser`.
   - invalida `["admin-users"]`.
5. Errores se muestran en modal.

Acceso:

- Ruta protegida solo para `ADMIN`.

---

## 5.7 Perfil del usuario autenticado

Archivo: `src/pages/UserPage.tsx`

- `useQuery(["me"], getMe)` para perfil.
- Muestra datos personales, estado (`disabled`) y roles.
- Es una vista de consulta para usuario logueado.

---

## 6) Tipos y contratos de datos

Archivos principales:

- `src/types/IUser.ts`: usuario, roles (`ADMIN`, `STOCK`, `PEDIDOS`, `CLIENT`).
- `src/types/IOrder.ts`: pedido, estados, detalle y forma de pago.
- `src/types/IProduct.ts`, `ICategorie.ts`, `IIngredient.ts`, `IAdminUser.ts`.

Papel de esta capa:

- Garantizar tipado fuerte en páginas/services.
- Definir shape esperado en UI.
- Separar modelo backend de modelo frontend (mapping en services cuando cambia naming).

---

## 7) ¿Dónde ocurre cada responsabilidad?

- **Autenticación**: `auth.service.ts` + `auth.store.ts` + `LoginPage.tsx`
- **Autorización por ruta**: `ProtectedRoute.tsx` + `AppRouter.tsx`
- **Autorización en UI (botones/links)**: `NavBar.tsx` + páginas (`hasRole`)
- **HTTP y manejo de errores**: `api.ts`
- **Sincronización server-state**: páginas con `useQuery/useMutation/invalidateQueries`
- **Transformación de modelos backend/frontend**: principalmente `product.service.ts`, `categories.service.ts`, `ingredients.service.ts`

---

## 8) Resumen del flujo principal (de punta a punta)

1. App inicia → `loadUser()` intenta recuperar sesión.
2. Si no autenticado → `/login`.
3. Login exitoso → cookie + `getMe()` + estado global autenticado.
4. Router y navbar aplican reglas por rol.
5. Usuario entra a módulos permitidos.
6. Cada página:
   - consulta datos (`useQuery`),
   - ejecuta acciones (`useMutation`),
   - refresca cache (`invalidateQueries`),
   - muestra feedback de error/éxito.
7. En acciones críticas (ej. cambio de estado pedido), backend valida reglas de negocio y frontend refleja respuesta.

---

## 9) Nota sobre seguridad y consistencia

- El frontend mejora UX ocultando opciones según rol.
- La seguridad real depende de backend (401/403 y validaciones de negocio).
- El uso de cookie HttpOnly + `withCredentials` mantiene sesión sin exponer token en JS.
- TanStack Query evita estado manual inconsistente tras mutaciones.

