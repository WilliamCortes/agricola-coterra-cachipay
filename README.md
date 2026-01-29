# Agrícola Coterra (Cachipay)

Tienda web (React + Vite) con API (Express) y base de datos (Postgres + Drizzle).

## Requisitos

- Node.js 20+
- Postgres (local o gestionado)

## Variables de entorno

Usa `.env` para desarrollo local. No lo commitees.

Referencia: [.env.example](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/.env.example)

Variables principales:

- `DATABASE_URL`: conexión a Postgres.
- `APP_BASE_URL`: URL base de la app (en local: `http://localhost:5000`).
- `ALLOWED_ORIGINS`: lista separada por comas de orígenes permitidos para CORS. En producción es obligatorio (si no se define, se usa `APP_BASE_URL`).
- `ADMIN_JWT_SECRET`: secreto para tokens del panel admin.
- `CLOUDINARY_URL`: conexión Cloudinary (si se usa sync de assets).
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL` (para reset de contraseña admin).

## Desarrollo local

1) Instalar dependencias:

```bash
npm install
```

2) Configurar `.env`:

- Copia `.env.example` → `.env`
- Ajusta `DATABASE_URL`, `APP_BASE_URL` y `ADMIN_JWT_SECRET`

3) Preparar base de datos:

```bash
npm run db:bootstrap
```

4) Iniciar:

```bash
npm run dev
```

App: `http://localhost:5000`

## Scripts útiles

- `npm run check`: TypeScript.
- `npm test`: unit tests.
- `npm run check:ci`: check + guardas de secretos + tests.
- `npm run db:migrate`: aplica migraciones (recomendado para producción).
- `npm run db:push`: solo para desarrollo (falla si `NODE_ENV=production`).
- `npm run admin:seed`: crea usuario admin (ver variables `ADMIN_SEED_*`).

## Checklist de producción (mínimo)

- Configurar env vars obligatorias: `DATABASE_URL`, `APP_BASE_URL`, `ALLOWED_ORIGINS`, `ADMIN_JWT_SECRET`.
- Verificar que `.env` y artefactos (`dist`, `dist-server`) NO estén trackeados.
- Usar migraciones (`npm run db:migrate`) y evitar `push` en producción.
- Validar endpoints básicos:
  - `GET /api/health` → 200
  - `GET /robots.txt` y `GET /sitemap.xml` → 200
- Revisar configuración de DNS/canonical y assets `og:image`.

## Notas de seguridad

- Admin usa cookies HttpOnly; las rutas `/api/admin/*` exigen requests same-origin por `Origin/Referer`.
- La API aplica headers de seguridad y CORS con allowlist.
