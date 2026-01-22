# Desarrollo (Windows)

## Contexto de Base de Datos (Supabase)
- En esta instancia, las tablas legacy `categories`, `products`, `testimonials` y `messages` están con owner `postgres`, y el usuario de `DATABASE_URL` (`app_user`) no puede hacer `ALTER/DROP/TRUNCATE` sobre ellas.
- Para evitar bloqueos por permisos, la app usa tablas propias para operar:
  - `store_categories`, `store_products`, `store_testimonials`
  - `contact_messages`
- Las tablas legacy se mantienen como solo lectura (para copiar datos iniciales cuando aplique).

## Variables de entorno
- `DATABASE_URL` (obligatoria)
- `PORT` (opcional, default 5000)
- `ADMIN_JWT_SECRET` (obligatoria para login admin)
- SMTP (opcional, solo si se desea recuperación por email):
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`

## Inicialización de BD (sin tocar tablas legacy)
Ejecuta una vez:

```bash
npm run db:bootstrap
```

Esto crea (si no existen) `contact_messages`, `store_categories`, `store_products`, `store_testimonials`.

## Seed de Admin
Configura en `.env`:
- `ADMIN_SEED_EMAIL`
- `ADMIN_SEED_PASSWORD`

Luego:

```bash
npm run admin:seed
```

## Correr el proyecto

```bash
npm run dev
```

Abrir: `http://localhost:5000/`

## Notas de diagnóstico
- Si `/api/admin/auth/me` responde `503`, falta `ADMIN_JWT_SECRET`.
- Si el formulario de contacto responde `503`, vuelve a correr `npm run db:bootstrap`.

