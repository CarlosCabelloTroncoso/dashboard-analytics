# Dashboard Analytics

Prueba técnica Frontend — Desarrollador Semi Senior  
Aplicación web con autenticación y dashboard analítico construida con **Next.js 15 + React 19 + TypeScript**.

---

## Cómo correr el proyecto localmente

### Requisitos previos

- Node.js 18.17 o superior
- npm 9 o superior

### Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/CarlosCabelloTroncoso/dashboard-analytics.git
cd dashboard-analytics

# 2. Instalar dependencias
npm install

# 3. Crear variables de entorno
cp .env.example .env.local

# 4. Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000]en el navegador.

### Credenciales de prueba

```
Email:    admin@dashboard.com
Password: admin123
```

> Las credenciales están definidas en `src/data/dashboard-data.json`.  
> En producción, las contraseñas estarían hasheadas con **bcrypt** y nunca almacenadas en texto plano.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── dashboard/        # Vista principal del dashboard
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/        # POST /api/auth/login
│   │   │   └── logout/       # POST /api/auth/logout
│   │   └── dashboard/        # GET /api/dashboard
│   └── auth/
│       └── login/            # Pantalla de login
├── data/
│   └── dashboard-data.json   # Fuente de datos
middleware.ts                 # Protección de rutas
```

---

## Decisión: App Router vs Pages Router

**Elección: App Router**

Elegí App Router por las siguientes razones concretas para este caso de uso:

- **Server Components nativos**: permiten hacer fetch de datos en el servidor sin enviar JS innecesario al cliente, ideal para el dashboard que carga datos al iniciar.
- **Route Groups** (`(dashboard)`): permiten organizar las rutas del dashboard con un layout compartido sin que afecte la URL.
- **Route Handlers** en `app/api/`: sintaxis más limpia y alineada con el estándar Web (`Request`/`Response`) en comparación con `pages/api`.
- **`loading.tsx` y `error.tsx`**: mecanismo de Suspense y manejo de errores integrado por convención de archivo, sin configuración extra.
- **Middleware** funciona igual en ambos routers, pero el App Router aprovecha mejor los layouts anidados para proteger secciones completas de la app.

Pages Router habría sido válido para un proyecto más simple o con una base de código legacy, pero para una app nueva App Router es la elección natural en Next.js 13+.

---

## Decisiones técnicas

### Gestión de estado: `useState` (React built-in)

Para este scope de aplicación (una pantalla de login y un dashboard), `useState` es suficiente y la elección correcta. No hay estado compartido entre múltiples componentes no relacionados que justifique añadir Zustand, Jotai o Context API.

**Si la app escalara** (múltiples páginas, estado de usuario global, filtros persistentes), migraría a **Zustand** por su API mínima y sin boilerplate.

### Persistencia de sesión: Cookie HttpOnly

Elegí **cookie HttpOnly** por encima de `localStorage` por razones de seguridad:

| | Cookie HttpOnly | localStorage |
|---|---|---|
| Accesible desde JS |  No | Sí |
| Vulnerable a XSS |  No | Sí |
| Enviada automáticamente | Sí | No |
| Legible por middleware | Sí | No |

La cookie se configura con `sameSite: 'strict'` y `secure: true` en producción, y el middleware de Next.js la lee directamente en el servidor sin exponerla al cliente.

### Librería de UI: Sin design system externo

Opté por **Tailwind CSS** sin una librería de componentes adicional (como shadcn/ui o MUI) para mantener las dependencias mínimas y demostrar dominio directo de estilos. El resultado es una interfaz limpia y funcional con bajo overhead de bundle.

**Con más tiempo** integraría **shadcn/ui** sobre Tailwind, ya que sus componentes son accesibles (ARIA), tipados y fácilmente personalizables al ser copiados directamente al proyecto.

### Librería de gráficos: Recharts

Elegí **Recharts** porque:
- Es React-native (componentes declarativos, no imperativo como Chart.js)
- Soporta `ResponsiveContainer` para layouts fluidos
- Liviano y bien tipado con TypeScript
- Integración natural con el modelo de datos del JSON

---

## Flujo de autenticación

```
Usuario → POST /api/auth/login
       → Valida email/password contra dashboard-data.json
       → Setea cookie HttpOnly "auth-token"
       → Redirige a /dashboard

middleware.ts → Lee cookie en cada request
             → /dashboard sin cookie → redirect /auth/login
             → /auth/login con cookie → redirect /dashboard

POST /api/auth/logout → maxAge: 0 → elimina cookie → redirect /auth/login
```

---

## API interna

| Método | Endpoint | Descripción | Auth requerida |
|---|---|---|---|
| `POST` | `/api/auth/login` | Valida credenciales, setea cookie | No |
| `POST` | `/api/auth/logout` | Elimina cookie de sesión | No |
| `GET` | `/api/dashboard` | Retorna datos completos del dashboard | Sí |

El endpoint `/api/dashboard` valida el token de la cookie contra el JSON antes de responder. Si el token no coincide, retorna `401 Unauthorized`.

---

## Tiempo invertido



| Tarea | Tiempo estimado |
|---|---|
| Setup inicial + estructura | ~1 hr |
| Autenticación (login, logout, middleware) | ~3 hrs |
| Dashboard (UI, gráfico, tabla, filtro) | ~5 hrs |
| Revisión y limpieza de código | ~9 hrs |
| README | ~2 hrs |
| **Total** | **~20 hrs** |

---

## Mejoras que haría con más tiempo

### Seguridad
- **Contraseñas hasheadas con bcrypt**: actualmente se comparan en texto plano porque el JSON de prueba las almacena así. En producción: `bcrypt.compare(password, storedHash)`.
- **JWT firmado con `jose`**: el token actual es un string estático (`"mock-jwt-token-12345"`). Con `jose` se generaría un JWT firmado con una clave secreta y con expiración real verificable en el servidor.
- **Rate limiting** en `/api/auth/login` para prevenir fuerza bruta.

### Arquitectura
- **Separar Server Component del Client Component** en el dashboard: el fetch inicial podría hacerse en el servidor y pasar los datos como props al componente cliente (que solo manejaría la interactividad: búsqueda, logout).
- **Función de servicio dedicada** en `src/lib/dashboardService.ts` para centralizar el consumo de la API, en lugar de `fetch()` inline en el componente.
- **Helper utilitario** `src/lib/data.ts` para `readFileSync` del JSON, evitando duplicar esa lógica en cada Route Handler.

### TypeScript
- **Interfaces tipadas** para todas las entidades (`User`, `Metric`, `Transaction`, `Target`, `DashboardData`) en `src/types/dashboard.ts`, eliminando todos los `any`.

### UX y calidad
- **Tests unitarios** con Vitest + Testing Library en el middleware y los Route Handlers.
- **`loading.tsx`** en la ruta del dashboard para un estado de carga con Suspense.
- **`error.tsx`** como Error Boundary para manejar fallos del fetch en la UI.
- **Responsive design**: el grid de KPI cards no colapsa correctamente en mobile (necesita `grid-cols-2` en breakpoint `sm`).
- **Metadata API** de Next.js para SEO básico (`title`, `description`).
- **Animaciones de transición** entre rutas con `framer-motion`.

---

## Variables de entorno

Crear un archivo `.env.local` en la raíz con:

```env
# URL base de la aplicación (necesario para fetch server-side)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Entorno
NODE_ENV=development
```

Ver `.env.example` para referencia.

---

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linting con ESLint
```

---

## Supuestos tomados

- **Un único usuario**: el JSON define un solo `user`. Se asumió que no se requiere manejo de múltiples usuarios ni registro.
- **Sin base de datos**: el archivo `dashboard-data.json` es la única fuente de verdad, leído con `fs.readFileSync` desde los Route Handlers.
- **Token estático**: dado que el JSON provee un `token` fijo, se usó ese valor directamente. En un escenario real se generaría un JWT en el momento del login.
- **Búsqueda client-side**: el filtro de transacciones se aplica en el cliente sobre los datos ya cargados, sin llamadas adicionales a la API, lo cual es apropiado para el volumen de datos del JSON.