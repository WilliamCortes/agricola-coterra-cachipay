# 🏗️ REPORTE DE ARQUITECTURA - FOREST-ELEMENTAL

**Fecha:** Enero 23, 2026  
**Proyecto:** Forest-Elemental (E-commerce Agrícola)  
**Versión:** 1.0.0

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura General](#arquitectura-general)
4. [Estructura de Carpetas](#estructura-de-carpetas)
5. [Base de Datos](#base-de-datos)
6. [Endpoints del Backend (API)](#endpoints-del-backend-api)
7. [Rutas del Frontend](#rutas-del-frontend)
8. [Módulos y Características](#módulos-y-características)
9. [Patrones Arquitectónicos](#patrones-arquitectónicos)
10. [Seguridad y Autenticación](#seguridad-y-autenticación)
11. [Dependencias Principales](#dependencias-principales)

---

## 🎯 VISIÓN GENERAL

**Forest-Elemental** es una plataforma de e-commerce especializada en productos agrícolas y de ganadería, con un sistema administrativo completo.

**Características principales:**
- 🛒 Storefront (tienda pública) para clientes
- 🔐 Dashboard administrativo protegido con autenticación JWT
- 📦 Gestión completa de inventario y almacenes
- 👥 Gestión de clientes y pedidos
- 📊 Reportes y análítica
- 🌍 Sincronización con Cloudinary para imágenes
- 💳 Integración con métodos de pago
- 📧 Sistema de notificaciones por email

---

## 🛠️ STACK TECNOLÓGICO

### Frontend
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **React** | 18.3.1 | Framework UI |
| **TypeScript** | Latest | Tipado estático |
| **Vite** | 7.3.1 | Bundler y dev server |
| **React Router (Wouter)** | 3.3.5 | Enrutamiento SPA |
| **TailwindCSS** | 4.x | Estilos CSS utility-first |
| **Radix UI** | Latest | Componentes accesibles |
| **React Query (TanStack)** | 5.60.5 | Gestión de estado async |
| **React Hook Form** | 7.55.0 | Gestión de formularios |
| **Zod** | 3.24.2 | Validación de esquemas |
| **Framer Motion** | 11.18.2 | Animaciones |
| **Recharts** | 2.15.2 | Gráficos y reportes |

### Backend
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Express** | 5.0.1 | Framework web |
| **Node.js** | 20.x | Runtime |
| **TypeScript** | Latest | Tipado estático |
| **Drizzle ORM** | 0.39.3 | ORM type-safe |
| **PostgreSQL** | Latest | Base de datos |
| **Passport.js** | 0.7.0 | Autenticación local |
| **JWT (Jose)** | 6.1.3 | Tokens JWT |
| **Cloudinary** | 2.9.0 | CDN para imágenes |
| **Nodemailer** | 7.0.12 | Envío de emails |

### Base de Datos
| Herramienta | Propósito |
|-----------|----------|
| **PostgreSQL** | BD relacional principal |
| **Drizzle Kit** | Migraciones y esquema |

### DevOps
| Herramienta | Propósito |
|-----------|----------|
| **Vercel** | Deployment |
| **tsx** | Ejecución TypeScript en Node.js |
| **cross-env** | Variables de entorno multiplataforma |

---

## 🏛️ ARQUITECTURA GENERAL

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                         │
│                    React + TypeScript                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/WebSocket
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (client/)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Pages: Home, Products, Cart, Contact, Privacy       │  │
│  │ Features: Admin, Cart                               │  │
│  │ Components: UI Kit (Radix), Forms, ProductCard      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    API EXPRESS (server/)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Admin Routes:                                        │  │
│  │ - Auth (Login, Logout, Reset Password)              │  │
│  │ - Products (CRUD)                                   │  │
│  │ - Inventory (Warehouses, Stock Levels)              │  │
│  │ - Orders (CRUD, Status, Returns)                    │  │
│  │ - Customers (CRUD, Notes, Interactions)             │  │
│  │ - Reports (Analytics)                               │  │
│  │ - Settings (Business Config)                        │  │
│  │                                                      │  │
│  │ Storefront Routes:                                  │  │
│  │ - Categories (List, Get)                            │  │
│  │ - Products (List, GetByCategory)                    │  │
│  │ - Testimonials (List)                               │  │
│  │ - Contact (Submit)                                  │  │
│  │ - Orders (Create)                                   │  │
│  │ - Settings (Storefront config)                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Modules:                                             │  │
│  │ - Admin (Application, Domain, Infrastructure)       │  │
│  │ - Storefront (Application, Domain, Infrastructure)  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  SERVICES & INFRASTRUCTURE                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ - Storage Service (storage.ts)                       │  │
│  │ - DB Service (db.ts)                                │  │
│  │ - JWT/Token Service                                 │  │
│  │ - Password Hashing (Scrypt)                         │  │
│  │ - Email Service (Nodemailer)                        │  │
│  │ - Cloudinary Integration                           │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Tablas principales:                                 │  │
│  │ - store_products, store_categories                  │  │
│  │ - orders, order_items, order_status_history        │  │
│  │ - customers, customer_notes, customer_interactions │  │
│  │ - warehouses, stock_levels, inventory_movements    │  │
│  │ - admin_users, admin_refresh_tokens                │  │
│  │ - business_settings                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 ESTRUCTURA DE CARPETAS

```
Forest-Elemental/
│
├── 📁 client/                          # Frontend React
│   ├── public/                         # Archivos estáticos
│   ├── src/
│   │   ├── App.tsx                    # Componente raíz con routing
│   │   ├── main.tsx                   # Punto de entrada
│   │   ├── index.css                  # Estilos globales
│   │   │
│   │   ├── 📁 pages/                  # Páginas de la aplicación
│   │   │   ├── Home.tsx               # Página principal
│   │   │   ├── Products.tsx           # Catálogo de productos
│   │   │   ├── Cart.tsx               # Carrito de compras
│   │   │   ├── Contact.tsx            # Formulario de contacto
│   │   │   ├── Privacy.tsx            # Política de privacidad
│   │   │   └── not-found.tsx          # 404
│   │   │
│   │   ├── 📁 components/             # Componentes reutilizables
│   │   │   ├── ContactForm.tsx        # Formulario de contacto
│   │   │   ├── CookieBanner.tsx       # Banner de cookies
│   │   │   ├── Footer.tsx             # Pie de página
│   │   │   ├── Navbar.tsx             # Barra de navegación
│   │   │   ├── ProductCard.tsx        # Tarjeta de producto
│   │   │   ├── WhatsAppButton.tsx     # Botón WhatsApp flotante
│   │   │   │
│   │   │   └── 📁 ui/                 # Componentes Radix UI
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── form.tsx
│   │   │       ├── input.tsx
│   │   │       ├── select.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── alert.tsx
│   │   │       ├── tabs.tsx
│   │   │       ├── accordion.tsx
│   │   │       ├── dropdown-menu.tsx
│   │   │       ├── carousel.tsx
│   │   │       └── ... (más componentes UI)
│   │   │
│   │   ├── 📁 features/               # Características complejas
│   │   │   │
│   │   │   ├── 📁 admin/              # Módulo de administración
│   │   │   │   └── presentation/
│   │   │   │       ├── pages/
│   │   │   │       │   ├── AdminLoginPage.tsx
│   │   │   │       │   ├── AdminForgotPasswordPage.tsx
│   │   │   │       │   ├── AdminResetPasswordPage.tsx
│   │   │   │       │   ├── AdminOverviewPage.tsx
│   │   │   │       │   ├── AdminProductsPage.tsx
│   │   │   │       │   ├── AdminInventoryPage.tsx
│   │   │   │       │   ├── AdminOrdersPage.tsx
│   │   │   │       │   ├── AdminCustomersPage.tsx
│   │   │   │       │   ├── AdminCategoriesPage.tsx
│   │   │   │       │   ├── AdminReportsPage.tsx
│   │   │   │       │   └── AdminSettingsPage.tsx
│   │   │   │       └── components/
│   │   │   │
│   │   │   └── 📁 cart/               # Módulo de carrito
│   │   │       └── presentation/
│   │   │           └── CartProvider.tsx
│   │   │
│   │   ├── 📁 hooks/                  # Custom React Hooks
│   │   │   ├── use-mobile.tsx         # Detectar viewport móvil
│   │   │   ├── use-store.ts           # Gestión de estado global
│   │   │   └── use-toast.ts           # Toasts/Notificaciones
│   │   │
│   │   ├── 📁 lib/                    # Utilidades
│   │   │   ├── queryClient.ts         # Instancia de React Query
│   │   │   └── utils.ts               # Funciones auxiliares
│   │   │
│   │   └── 📁 assets/                 # Imágenes y media
│   │
│   └── index.html                     # HTML principal
│
├── 📁 server/                          # Backend Express
│   ├── app.ts                         # Configuración de Express
│   ├── index.ts                       # Punto de entrada
│   ├── routes.ts                      # Rutas principales y seeding
│   ├── db.ts                          # Inicialización de Drizzle
│   ├── storage.ts                     # Servicio de almacenamiento
│   ├── vite.ts                        # Integración Vite para dev
│   ├── static.ts                      # Archivos estáticos
│   │
│   └── 📁 modules/                    # Módulos de negocios
│       ├── 📁 admin/                  # Módulo administrativo
│       │   ├── 📁 application/        # Casos de uso
│       │   │   └── useCases/
│       │   │       ├── LoginAdminUseCase.ts
│       │   │       ├── RefreshAdminSessionUseCase.ts
│       │   │       ├── LogoutAdminUseCase.ts
│       │   │       ├── GetCurrentAdminUseCase.ts
│       │   │       ├── RequestPasswordResetUseCase.ts
│       │   │       ├── ResetPasswordUseCase.ts
│       │   │       └── ... (más casos de uso)
│       │   │
│       │   ├── 📁 domain/             # Entidades de negocio
│       │   │   └── ... (modelos de dominio)
│       │   │
│       │   ├── 📁 infrastructure/     # Implementaciones técnicas
│       │   │   ├── repositories/      # Acceso a datos
│       │   │   │   ├── DrizzleAdminUserRepository.ts
│       │   │   │   ├── DrizzleAdminRefreshTokenRepository.ts
│       │   │   │   └── DrizzlePasswordResetTokenRepository.ts
│       │   │   ├── crypto/            # Seguridad
│       │   │   │   ├── ScryptPasswordHasher.ts
│       │   │   │   └── TokenGenerator.ts
│       │   │   ├── jwt/               # JWT
│       │   │   │   └── JoseTokenService.ts
│       │   │   ├── email/             # Notificaciones
│       │   │   │   └── NodemailerEmailSender.ts
│       │   │   ├── clock/             # Manejo de tiempo
│       │   │   │   └── SystemClock.ts
│       │   │   └── cloudinary/        # CDN
│       │   │       └── cloudinaryClient.ts
│       │   │
│       │   └── 📁 presentation/       # Rutas HTTP
│       │       ├── adminAuthRoutes.ts
│       │       ├── adminProductRoutes.ts
│       │       ├── adminInventoryRoutes.ts
│       │       ├── adminOrderRoutes.ts
│       │       ├── adminCustomerRoutes.ts
│       │       ├── adminReportRoutes.ts
│       │       ├── adminSettingsRoutes.ts
│       │       └── http/
│       │           ├── cookies.ts     # Manejo de cookies
│       │           ├── rateLimit.ts   # Rate limiting
│       │           └── requireAdminAuth.ts  # Middleware auth
│       │
│       └── 📁 storefront/             # Módulo de tienda pública
│           ├── 📁 application/
│           ├── 📁 domain/
│           ├── 📁 infrastructure/
│           └── 📁 presentation/
│               └── storefrontRoutes.ts
│
├── 📁 shared/                          # Código compartido
│   ├── routes.ts                      # Definición de rutas API
│   ├── schema.ts                      # Reexporta esquemas
│   ├── schema.base.ts                 # Esquemas Drizzle y Zod
│   └── schema.messages.ts             # Esquemas de mensajes
│
├── 📁 migrations/                      # Migraciones de BD
│   ├── 0000_motionless_morlocks.sql   # Migración inicial
│   ├── 0001_storefront_orders.sql     # Tablas de órdenes
│   └── meta/                          # Metadatos de migraciones
│
├── 📁 script/                          # Scripts de utilidad
│   ├── build.ts                       # Script de build
│   ├── cloudinarySync.ts              # Sincronización Cloudinary
│   ├── dbBootstrap.ts                 # Inicialización de BD
│   └── seedAdminUser.ts               # Seeding de admin
│
├── 📁 dist-server/                     # Build del servidor compilado
│   └── index.cjs
│
├── 📁 dist/                            # Build del cliente compilado
│
├── 📁 api/                             # API Functions (Vercel)
│   └── index.ts
│
├── 📁 stitch_car/                      # Componente especial
│   └── code.html
│
├── drizzle.config.ts                  # Configuración Drizzle
├── vite.config.ts                     # Configuración Vite
├── tsconfig.json                      # Configuración TypeScript
├── tailwind.config.ts                 # Configuración TailwindCSS
├── postcss.config.js                  # Configuración PostCSS
├── vercel.json                        # Configuración Vercel
├── package.json                       # Dependencias y scripts
└── README.md                          # Documentación
```

---

## 🗄️ BASE DE DATOS

### Estructura de Tablas

#### 📦 Gestión de Productos y Categorías

```sql
-- Categorías
store_categories {
  id (PK): serial
  name: text NOT NULL
  slug: text NOT NULL UNIQUE
  description: text
  imageUrl: text
  parentId: integer (FK → store_categories)
  sortOrder: integer DEFAULT 0
}

-- Productos
store_products {
  id (PK): serial
  categoryId: integer (FK → store_categories)
  name: text NOT NULL
  description: text NOT NULL
  price: integer NOT NULL (en centavos)
  imageUrl: text
  stock: integer DEFAULT 100
  sku: text UNIQUE
  barcode: text UNIQUE
  costPrice: integer NOT NULL DEFAULT 0
  promoPrice: integer
  stockMin: integer DEFAULT 0
  stockMax: integer
  unit: text
  supplier: text
  expiresAt: timestamp with timezone
  tags: text[] (array)
  isActive: boolean DEFAULT true
  createdAt: timestamp with timezone DEFAULT NOW()
}

-- Imágenes de Productos
product_images {
  id (PK): serial
  productId: integer NOT NULL (FK → store_products, CASCADE)
  url: text NOT NULL
  sortOrder: integer DEFAULT 0
  createdAt: timestamp with timezone DEFAULT NOW()
}
```

#### 🏭 Gestión de Inventario

```sql
-- Almacenes
warehouses {
  id (PK): serial
  name: text NOT NULL
  location: text
  isActive: boolean DEFAULT true
  createdAt: timestamp with timezone DEFAULT NOW()
}

-- Niveles de Stock
stock_levels {
  id (PK): serial
  productId: integer NOT NULL (FK → store_products, CASCADE)
  warehouseId: integer NOT NULL (FK → warehouses, CASCADE)
  quantity: integer DEFAULT 0
  updatedAt: timestamp with timezone DEFAULT NOW()
}

-- Movimientos de Inventario
inventory_movements {
  id (PK): serial
  productId: integer NOT NULL (FK → store_products, CASCADE)
  warehouseId: integer NOT NULL (FK → warehouses, CASCADE)
  type: text NOT NULL
  quantity: integer NOT NULL
  reason: text
  notes: text
  createdByAdminUserId: integer (FK → admin_users, SET NULL)
  createdAt: timestamp with timezone DEFAULT NOW()
}
```

#### 👥 Gestión de Clientes

```sql
-- Clientes
customers {
  id (PK): serial
  name: text NOT NULL
  email: text
  phone: text
  segment: text
  communicationPreferences: jsonb
  isActive: boolean DEFAULT true
  createdAt: timestamp with timezone DEFAULT NOW()
}

-- Notas de Cliente
customer_notes {
  id (PK): serial
  customerId: integer NOT NULL (FK → customers, CASCADE)
  note: text NOT NULL
  createdByAdminUserId: integer (FK → admin_users, SET NULL)
  createdAt: timestamp with timezone DEFAULT NOW()
}

-- Interacciones de Cliente
customer_interactions {
  id (PK): serial
  customerId: integer NOT NULL (FK → customers, CASCADE)
  type: text NOT NULL
  note: text
  createdAt: timestamp with timezone DEFAULT NOW()
}
```

#### 📋 Gestión de Pedidos

```sql
-- Pedidos
orders {
  id (PK): serial
  orderNumber: text NOT NULL UNIQUE
  customerId: integer (FK → customers, SET NULL)
  status: text NOT NULL
  total: integer DEFAULT 0
  notes: text
  deliveryAddress: text
  assignedDelivery: text
  shippingGuideNumber: text
  createdAt: timestamp with timezone DEFAULT NOW()
}

-- Ítems de Pedido
order_items {
  id (PK): serial
  orderId: integer NOT NULL (FK → orders, CASCADE)
  productId: integer (FK → store_products, SET NULL)
  name: text NOT NULL
  quantity: integer NOT NULL
  unitPrice: integer NOT NULL
  total: integer NOT NULL
}

-- Historial de Estado de Pedidos
order_status_history {
  id (PK): serial
  orderId: integer NOT NULL (FK → orders, CASCADE)
  fromStatus: text
  toStatus: text NOT NULL
  note: text
  changedByAdminUserId: integer (FK → admin_users, SET NULL)
  createdAt: timestamp with timezone DEFAULT NOW()
}

-- Devoluciones
order_returns {
  id (PK): serial
  orderId: integer NOT NULL (FK → orders, CASCADE)
  reason: text NOT NULL
  amount: integer DEFAULT 0
  createdAt: timestamp with timezone DEFAULT NOW()
}
```

#### 🔐 Autenticación y Admin

```sql
-- Usuarios Admin
admin_users {
  id (PK): serial
  email: text NOT NULL UNIQUE
  passwordHash: text NOT NULL
  role: text NOT NULL
  isActive: boolean DEFAULT true
  createdAt: timestamp with timezone DEFAULT NOW()
}

-- Tokens de Refresh
admin_refresh_tokens {
  id (PK): serial
  adminUserId: integer NOT NULL (FK → admin_users, CASCADE)
  tokenHash: text NOT NULL UNIQUE
  expiresAt: timestamp with timezone NOT NULL
  revokedAt: timestamp with timezone
  createdAt: timestamp with timezone DEFAULT NOW()
}

-- Tokens de Reset de Contraseña
password_reset_tokens {
  id (PK): serial
  adminUserId: integer NOT NULL (FK → admin_users, CASCADE)
  tokenHash: text NOT NULL UNIQUE
  expiresAt: timestamp with timezone NOT NULL
  usedAt: timestamp with timezone
  createdAt: timestamp with timezone DEFAULT NOW()
}

-- Log de Actividad Admin
admin_activity_logs {
  id (PK): serial
  adminUserId: integer (FK → admin_users, SET NULL)
  action: text NOT NULL
  ip: text
  userAgent: text
  metadata: jsonb
  createdAt: timestamp with timezone DEFAULT NOW()
}
```

#### ⚙️ Configuración del Negocio

```sql
-- Configuración de Negocio
business_settings {
  id (PK): serial
  businessName: text NOT NULL
  nit: text
  address: text
  phone: text
  socialLinks: jsonb
  paymentMethods: jsonb
  shippingCosts: jsonb
  autoMessages: jsonb
  updatedAt: timestamp with timezone DEFAULT NOW()
}

-- Testimonios
store_testimonials {
  id (PK): serial
  name: text NOT NULL
  role: text NOT NULL
  content: text NOT NULL
  rating: integer DEFAULT 5
}
```

#### 📨 Mensajes de Contacto

```sql
-- Mensajes
messages {
  id (PK): serial
  name: text NOT NULL
  email: text NOT NULL
  message: text NOT NULL
}
```

---

## 🔌 ENDPOINTS DEL BACKEND (API)

### Autenticación Admin (`/api/admin/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/admin/auth/login` | Login de administrador | ❌ |
| POST | `/api/admin/auth/refresh` | Refrescar token JWT | ❌ |
| POST | `/api/admin/auth/logout` | Logout de administrador | ✅ |
| GET | `/api/admin/auth/current` | Obtener usuario actual | ✅ |
| POST | `/api/admin/auth/forgot-password` | Solicitar reset de contraseña | ❌ |
| POST | `/api/admin/auth/reset-password` | Resetear contraseña | ❌ |

### Productos Admin (`/api/admin/products`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/products` | Listar productos | ✅ |
| POST | `/api/admin/products` | Crear producto | ✅ |
| GET | `/api/admin/products/:id` | Obtener producto | ✅ |
| PATCH | `/api/admin/products/:id` | Actualizar producto | ✅ |
| DELETE | `/api/admin/products/:id` | Eliminar producto | ✅ |
| POST | `/api/admin/products/:id/images` | Subir imagen de producto | ✅ |
| DELETE | `/api/admin/products/:id/images/:imageId` | Eliminar imagen | ✅ |

### Inventario Admin (`/api/admin/inventory`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/inventory/warehouses` | Listar almacenes | ✅ |
| POST | `/api/admin/inventory/warehouses` | Crear almacén | ✅ |
| GET | `/api/admin/inventory/warehouses/:id` | Obtener almacén | ✅ |
| PATCH | `/api/admin/inventory/warehouses/:id` | Actualizar almacén | ✅ |
| DELETE | `/api/admin/inventory/warehouses/:id` | Eliminar almacén | ✅ |
| GET | `/api/admin/inventory/stock-levels` | Listar niveles de stock | ✅ |
| PATCH | `/api/admin/inventory/stock-levels/:id` | Actualizar stock | ✅ |
| POST | `/api/admin/inventory/movements` | Registrar movimiento | ✅ |
| GET | `/api/admin/inventory/movements` | Listar movimientos | ✅ |

### Pedidos Admin (`/api/admin/orders`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/orders` | Listar pedidos | ✅ |
| GET | `/api/admin/orders/:id` | Obtener pedido | ✅ |
| PATCH | `/api/admin/orders/:id/status` | Cambiar estado | ✅ |
| POST | `/api/admin/orders/:id/notes` | Agregar nota a pedido | ✅ |
| POST | `/api/admin/orders/:id/return` | Registrar devolución | ✅ |

### Clientes Admin (`/api/admin/customers`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/customers` | Listar clientes | ✅ |
| GET | `/api/admin/customers/:id` | Obtener cliente | ✅ |
| PATCH | `/api/admin/customers/:id` | Actualizar cliente | ✅ |
| POST | `/api/admin/customers/:id/notes` | Agregar nota | ✅ |
| POST | `/api/admin/customers/:id/interactions` | Registrar interacción | ✅ |

### Categorías Admin (`/api/admin/categories`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/categories` | Listar categorías | ✅ |
| POST | `/api/admin/categories` | Crear categoría | ✅ |
| GET | `/api/admin/categories/:id` | Obtener categoría | ✅ |
| PATCH | `/api/admin/categories/:id` | Actualizar categoría | ✅ |
| DELETE | `/api/admin/categories/:id` | Eliminar categoría | ✅ |

### Reportes Admin (`/api/admin/reports`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/reports/sales` | Reporte de ventas | ✅ |
| GET | `/api/admin/reports/inventory` | Reporte de inventario | ✅ |
| GET | `/api/admin/reports/customers` | Reporte de clientes | ✅ |

### Configuración Admin (`/api/admin/settings`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/settings` | Obtener configuración | ✅ |
| PATCH | `/api/admin/settings` | Actualizar configuración | ✅ |

### Storefront - Catálogo

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories` | Listar categorías | ❌ |
| GET | `/api/categories/:slug` | Obtener categoría | ❌ |
| GET | `/api/products` | Listar productos | ❌ |
| GET | `/api/categories/:slug/products` | Productos por categoría | ❌ |
| GET | `/api/testimonials` | Listar testimonios | ❌ |

### Storefront - Órdenes y Contacto

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Crear pedido | ❌ |
| POST | `/api/contact` | Enviar mensaje de contacto | ❌ |
| GET | `/api/storefront/settings` | Obtener configuración tienda | ❌ |

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Estado de servidor |

---

## 🗺️ RUTAS DEL FRONTEND

### Rutas Públicas (Storefront)

| Ruta | Componente | Propósito |
|------|-----------|----------|
| `/` | `Home` | Página principal |
| `/products` | `Products` | Catálogo de productos |
| `/contact` | `Contact` | Formulario de contacto |
| `/privacy` | `Privacy` | Política de privacidad |
| `/cart` | `Cart` | Carrito de compras |

### Rutas de Administración

| Ruta | Componente | Propósito |
|------|-----------|----------|
| `/admin/login` | `AdminLoginPage` | Login administrativo |
| `/admin/forgot-password` | `AdminForgotPasswordPage` | Recuperar contraseña |
| `/admin/reset-password` | `AdminResetPasswordPage` | Resetear contraseña |
| `/admin` | `AdminOverviewPage` | Dashboard principal |
| `/admin/productos` | `AdminProductsPage` | Gestión de productos |
| `/admin/inventario` | `AdminInventoryPage` | Gestión de inventario |
| `/admin/pedidos` | `AdminOrdersPage` | Gestión de pedidos |
| `/admin/clientes` | `AdminCustomersPage` | Gestión de clientes |
| `/admin/categorias` | `AdminCategoriesPage` | Gestión de categorías |
| `/admin/reportes` | `AdminReportsPage` | Reportes y análítica |
| `/admin/configuracion` | `AdminSettingsPage` | Configuración del negocio |

### Rutas no encontradas

| Ruta | Componente |
|------|-----------|
| `*` | `not-found` |

---

## 🧩 MÓDULOS Y CARACTERÍSTICAS

### 🔐 Módulo Admin

**Estructura:**
```
server/modules/admin/
├── application/        # Lógica de negocio
│   └── useCases/      # Casos de uso de Clean Architecture
│       ├── LoginAdminUseCase
│       ├── RefreshAdminSessionUseCase
│       ├── LogoutAdminUseCase
│       ├── GetCurrentAdminUseCase
│       ├── RequestPasswordResetUseCase
│       └── ResetPasswordUseCase
├── domain/            # Entidades de dominio
├── infrastructure/    # Implementaciones técnicas
│   ├── repositories/  # Acceso a datos (Drizzle)
│   ├── crypto/        # Hashing de contraseñas (Scrypt)
│   ├── jwt/           # Gestión de JWT (Jose)
│   ├── email/         # Notificaciones (Nodemailer)
│   └── clock/         # Manejo de tiempo
└── presentation/      # Rutas HTTP
    ├── adminAuthRoutes.ts
    ├── adminProductRoutes.ts
    ├── adminInventoryRoutes.ts
    ├── adminOrderRoutes.ts
    ├── adminCustomerRoutes.ts
    ├── adminReportRoutes.ts
    ├── adminSettingsRoutes.ts
    └── http/
        ├── cookies.ts      # Gestión de cookies JWT
        ├── rateLimit.ts    # Rate limiting
        └── requireAdminAuth.ts  # Middleware de autenticación
```

**Características:**
- ✅ Autenticación con JWT
- ✅ Refresh tokens con rotación
- ✅ Contraseñas hasheadas con Scrypt
- ✅ Recovery de contraseña por email
- ✅ Logging de actividad
- ✅ Rate limiting
- ✅ Gestión de productos CRUD
- ✅ Control de inventario multi-almacén
- ✅ Gestión completa de órdenes
- ✅ Seguimiento de clientes
- ✅ Reportes de negocio

### 🛒 Módulo Storefront

**Estructura:**
```
server/modules/storefront/
├── application/
├── domain/
├── infrastructure/
└── presentation/
    └── storefrontRoutes.ts
```

**Características:**
- ✅ Catálogo de productos
- ✅ Búsqueda y filtrado por categoría
- ✅ Creación de órdenes
- ✅ Formulario de contacto
- ✅ Testimonios

### 🛒 Módulo Cart (Frontend)

**Características:**
- ✅ Context API para gestión global del carrito
- ✅ Persistencia en localStorage
- ✅ Agregar/eliminar productos
- ✅ Actualizar cantidades

---

## 🏗️ PATRONES ARQUITECTÓNICOS

### 1. **Clean Architecture**

El código backend sigue los principios de Clean Architecture:

```
Presentation Layer (Routes HTTP)
        ↓
Application Layer (Use Cases)
        ↓
Domain Layer (Business Rules)
        ↓
Infrastructure Layer (DB, Email, etc.)
```

**Ventajas:**
- Independencia de frameworks
- Fácil de testear
- Código limpio y mantenible
- Separación de responsabilidades

### 2. **Repository Pattern**

Implementado en la infraestructura para acceso a datos:

```typescript
// Interfaz
interface IAdminUserRepository {
  findByEmail(email: string): Promise<AdminUser | null>;
  save(user: AdminUser): Promise<void>;
}

// Implementación con Drizzle
class DrizzleAdminUserRepository implements IAdminUserRepository {
  async findByEmail(email: string) {
    return db.select().from(adminUsers).where(...);
  }
}
```

### 3. **Dependency Injection**

Las dependencias se inyectan en los casos de uso:

```typescript
class LoginAdminUseCase {
  constructor(
    private adminUserRepository: IAdminUserRepository,
    private passwordHasher: IPasswordHasher,
    private tokenService: ITokenService,
  ) {}
}
```

### 4. **Strategy Pattern**

Para implementaciones intercambiables (password hashing, email, JWT):

```typescript
interface IPasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

// Implementación: ScryptPasswordHasher
```

### 5. **Provider Pattern (Frontend)**

Para contexto global y providers:

```typescript
<CartProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* App */}
    </TooltipProvider>
  </QueryClientProvider>
</CartProvider>
```

---

## 🔒 SEGURIDAD Y AUTENTICACIÓN

### Flujo de Autenticación

```
1. Usuario envía email + contraseña
              ↓
2. Backend valida email existe en DB
              ↓
3. Verifica contraseña contra hash (Scrypt)
              ↓
4. Genera JWT access token (corta duración: 15 min)
              ↓
5. Genera refresh token (larga duración: 30 días)
              ↓
6. Almacena refresh token hasheado en DB
              ↓
7. Envía tokens en cookies HttpOnly
              ↓
8. Cliente usa access token para requests autenticados
              ↓
9. Cuando expira, usa refresh token para obtener nuevo access
```

### Seguridad Implementada

| Medida | Implementación |
|--------|----------------|
| **Hash de Contraseñas** | Scrypt con salts |
| **Tokens JWT** | Jose library con HS256 |
| **Cookies HttpOnly** | Protege contra XSS |
| **CSRF Protection** | Token en headers |
| **Rate Limiting** | Limite de intentos de login |
| **Password Reset** | Token temporal de 1 uso |
| **Refresh Token Rotation** | Tokens únicos y revocables |
| **Activity Logging** | Auditoría de acciones admin |
| **Session Management** | Expiraçión automática |

### Variables de Entorno Requeridas

```env
# JWT
ADMIN_JWT_SECRET=your_secret_key
ADMIN_ACCESS_TOKEN_TTL_SECONDS=900
ADMIN_REFRESH_TOKEN_TTL_SECONDS=2592000

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
SMTP_FROM_EMAIL=noreply@example.com

# BD
DATABASE_URL=postgresql://user:pass@localhost/dbname

# Cloudinary
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# APP
APP_BASE_URL=http://localhost:5000
```

---

## 📦 DEPENDENCIAS PRINCIPALES

### Frontend - UI y State Management

```json
{
  "@tanstack/react-query": "^5.60.5",     // State manager async
  "@radix-ui/...": "Latest",              // Componentes accesibles
  "wouter": "^3.3.5",                     // Router
  "react-hook-form": "^7.55.0",           // Manejo de formularios
  "zod": "^3.24.2",                       // Validación schemas
  "tailwindcss": "^4.x",                  // Estilos CSS
  "framer-motion": "^11.18.2",            // Animaciones
  "recharts": "^2.15.2",                  // Gráficos
  "lucide-react": "^0.453.0"              // Iconos
}
```

### Backend - API y BD

```json
{
  "express": "^5.0.1",                    // Framework web
  "drizzle-orm": "^0.39.3",               // ORM
  "pg": "^8.16.3",                        // Driver PostgreSQL
  "passport": "^0.7.0",                   // Autenticación
  "jose": "^6.1.3",                       // JWT
  "nodemailer": "^7.0.12",                // Email
  "cloudinary": "^2.9.0",                 // CDN
  "zod": "^3.24.2"                        // Validación
}
```

### Build y Dev Tools

```json
{
  "vite": "^7.3.1",                       // Build tool
  "typescript": "Latest",                 // Tipado
  "tsx": "Latest",                        // Ejecutar TS
  "drizzle-kit": "Latest"                 // Migraciones
}
```

---

## 🚀 SCRIPTS Y COMANDOS

### Desarrollo

```bash
npm run dev              # Inicia servidor dev con auto-reload
npm run build:client     # Build del frontend (Vite)
npm run check           # Chequeo de tipos TypeScript
```

### Base de Datos

```bash
npm run db:bootstrap    # Inicializa la BD con seeding
npm run db:push         # Push migraciones a BD
npm run cloudinary:sync # Sincroniza imágenes con Cloudinary
```

### Admin

```bash
npm run admin:seed      # Crea usuario admin por defecto
```

### Producción

```bash
npm run build           # Build completo (cliente + servidor)
npm start               # Inicia servidor en producción
```

### Testing

```bash
npm test                # Ejecuta tests con Node test runner
```

---

## 📊 DIAGRAMA DE FLUJO - CREAR PEDIDO

```
Cliente Frontend
    │
    ├─→ Selecciona productos del carrito
    │
    ├─→ Completa formulario de contacto
    │   (Nombre, Teléfono, Email, Dirección)
    │
    └─→ Envía POST /api/orders
            │
            ↓
    Backend Express
    │
    ├─→ Valida schema con Zod
    │
    ├─→ Verifica stock en BD
    │
    ├─→ Crea registros en BD:
    │   - orders (número, total, estado)
    │   - order_items (detalle productos)
    │   - customers (si es nuevo)
    │
    ├─→ Actualiza stock
    │
    ├─→ Envía email de confirmación
    │
    └─→ Retorna response con orderNumber y total
            │
            ↓
    Frontend
    │
    └─→ Muestra confirmación al cliente
```

---

## 🔄 FLUJO DE GESTIÓN DE PRODUCTOS (ADMIN)

```
Admin Frontend
    │
    ├─→ Login → JWT stored in HttpOnly cookies
    │
    ├─→ Navega a /admin/productos
    │
    ├─→ GET /api/admin/products
    │   (incluye Auth header con JWT)
    │
    └─→ Middleware verifica JWT
            │
            ├─✓ Token válido → Retorna lista
            │
            └─✗ Token inválido → 401 Unauthorized
    │
    ├─→ Crea nuevo producto:
    │   POST /api/admin/products {name, price, stock...}
    │
    ├─→ Backend:
    │   ├─ Valida schema
    │   ├─ Guarda en store_products
    │   ├─ Crea stock_levels en warehouse principal
    │   ├─ Registra en inventory_movements
    │   └─ Retorna producto creado
    │
    ├─→ Edita producto:
    │   PATCH /api/admin/products/:id
    │
    ├─→ Sube imágenes:
    │   POST /api/admin/products/:id/images
    │   → Sube a Cloudinary
    │   → Guarda URL en product_images
    │
    └─→ Elimina producto:
        DELETE /api/admin/products/:id
        → Cascade deletes: images, stock_levels, order_items
```

---

## 📈 ESCALABILIDAD Y FUTURO

### Mejoras Potenciales

1. **Caching**
   - Redis para sesiones
   - Cache de productos/categorías
   
2. **Búsqueda Avanzada**
   - Elasticsearch o similar
   
3. **Pagos**
   - Integración Stripe/PayPal
   
4. **Analytics**
   - Google Analytics
   - Datos de conversión
   
5. **Performance**
   - GraphQL
   - Connection pooling
   - CDN global
   
6. **Escalabilidad**
   - Microservicios
   - Message queues (RabbitMQ)
   - Load balancing

---

## 📝 RESUMEN TÉCNICO

| Aspecto | Detalles |
|--------|----------|
| **Lenguaje** | TypeScript (100%) |
| **Framework Frontend** | React 18 + Vite |
| **Framework Backend** | Express 5 |
| **Base de Datos** | PostgreSQL + Drizzle ORM |
| **Autenticación** | JWT + Refresh Tokens |
| **Hosting** | Vercel |
| **CDN Imágenes** | Cloudinary |
| **Email** | Nodemailer SMTP |
| **Estilos** | TailwindCSS + Radix UI |
| **State Management** | React Query + Context API |
| **Validación** | Zod (end-to-end) |
| **Rutas** | Wouter (frontend), Express (backend) |
| **Componentes UI** | 30+ componentes Radix Pre-built |
| **Migraciones** | Drizzle Kit |

---

## 🎓 CONCLUSIÓN

**Forest-Elemental** es una aplicación e-commerce profesional y escalable construida con:

- ✅ **Arquitectura limpia** que facilita mantenimiento y testing
- ✅ **Full-stack TypeScript** para consistencia y seguridad de tipos
- ✅ **Componentes reutilizables** y accesibles
- ✅ **Sistema de autenticación robusto** para admin
- ✅ **Gestión completa de inventario** y órdenes
- ✅ **Performance optimizado** con Vite y React Query
- ✅ **Escalable** con patrones de diseño probados

Este reporte proporciona el contexto técnico completo necesario para que un modelo de AI (como ChatGPT, Claude, etc.) entienda la arquitectura y pueda:
- Sugerir mejoras
- Identificar bugs
- Escribir nuevo código coherente
- Refactorizar componentes
- Optimizar performance

