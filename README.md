# Parcial Frontend - Admin App

Frontend desarrollado con React + Vite + TypeScript para la Parte 2 del parcial fullstack.

Esta aplicación corresponde al panel de administración del sistema.

## Checklist de requisitos

- [x] Setup: Proyecto creado con Vite + React + TypeScript.
- [x] Estructura: Arquitectura por **features** (`src/features/<dominio>`) + código compartido (`src/shared`) + `src/app` y `src/router`.
- [x] Componentes: Uso de componentes funcionales y props tipadas con TypeScript.
- [x] Estilos: Interfaz construida con Tailwind CSS 4.
- [x] Navegación: Configuración de `react-router-dom`.
- [x] Ruta dinámica: Detalle de producto con `/products/:id`.
- [x] Axios: Instancia central con `baseURL`, `withCredentials` e interceptor básico.
- [x] Variables de entorno: Uso de `.env` y `.env.example` con `VITE_API_URL`.
- [x] TanStack Query: Uso de `useQuery`, `useMutation` e `invalidateQueries`.
- [x] Zustand: Store global para autenticación.
- [x] TanStack Table: Implementado en la gestión de usuarios.
- [x] TanStack Form: Implementado en el formulario de login.
- [x] Auth: Login real, sesión con cookie HttpOnly, `/me` y logout.
- [x] Rutas protegidas y control de acceso por roles.
- [x] Catálogo: Productos, categorías e ingredientes con CRUD.
- [x] Stock: ADMIN y STOCK pueden modificar stock/disponibilidad.
- [x] Pedidos: Pantalla de gestión por estados.
- [x] Usuarios: Pantalla de administración de usuarios y roles. Filtrado por rol.

## Roles

- `ADMIN`: Acceso completo al panel.
- `STOCK`: Acceso al catálogo y modificación de stock/disponibilidad.
- `PEDIDOS`: Acceso al catálogo en modo lectura y gestión de pedidos.
- `CLIENT`: No puede acceder al panel de administración.

## Variables de entorno

Crear un archivo `.env` a partir de `.env.example` con:

```env
VITE_API_URL=http://localhost:8000
```

## Comandos

Instalar dependencias:

```bash
pnpm install
```

Ejecutar en desarrollo:

```bash
pnpm run dev
```

En desarrollo, `.env.development` define `VITE_API_BASE=/backend` y Vite reenvía eso al backend (`VITE_API_URL`). Abrí **solo** la URL que muestra `pnpm dev` (idealmente `http://localhost:5173`), no `127.0.0.1`.

Si ves errores de conexión, cerrá **todas** las pestañas del admin y matá instancias viejas de Vite (en PowerShell):

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
pnpm dev
```

Luego abrí la URL nueva que imprima la terminal y recargá con Ctrl+Shift+R.

Build de producción:

```bash
pnpm run build
```

## Arquitectura

El código vive bajo dominios de negocio, no bajo carpetas técnicas planas:

```
src/
  app/           # main.tsx, App.tsx
  router/        # AppRouter
  shared/        # api/client, NavBar, StockBadge, ProtectedRoute, useForm
  features/
    auth/
    profile/
    catalog/products | categories | ingredients
    orders/
    admin-users/
```

- Guía completa de la migración (mapa antes/después, equivalencias, checklist): [`GUIA-TRANSICION-ARQUITECTURA-ADMIN.md`](./GUIA-TRANSICION-ARQUITECTURA-ADMIN.md)
- Flujo funcional del panel (login, roles, módulos): [`ADMIN_APP_FRONTEND_FLUJO.md`](./ADMIN_APP_FRONTEND_FLUJO.md)

Imports: alias `@/` → `src/` (configurado en Vite y TypeScript).

## Nota final

Se intentó cumplir todos los requisitos principales de la Parte 2, reutilizando la base de la Parte 1 y adaptándola a un panel de administración real con autenticación, autorización por roles, catálogo, pedidos y usuarios.