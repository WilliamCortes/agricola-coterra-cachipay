## Objetivo
- Dejar el repo más simple y “limpio”, eliminando configs/archivos de Replit y estado de “agents/AI” que no aportan al funcionamiento.
- Mantener funcionalidad: build del cliente, APIs en Vercel (serverless), scripts de DB y tests.

## Hallazgos (candidatos claros a limpiar)
- Replit:
  - [.replit](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/.replit) (config de runtime/workflows/puertos de Replit).
  - Dependencias Replit en [package.json](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/package.json#L88-L92):
    - @replit/vite-plugin-cartographer
    - @replit/vite-plugin-dev-banner
    - @replit/vite-plugin-runtime-error-modal
  - Uso de esos plugins en [vite.config.ts](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/vite.config.ts#L1-L21).
- Estado local de Replit/agent (no debería vivir en el repo):
  - Carpeta [.local/state/replit/agent](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/.local/state/replit/agent/) con archivos bin/json de estado.
- Referencias “AI” residuales:
  - En [script/build.ts](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/script/build.ts#L5-L33) aparece `openai` y `@google/generative-ai` en una allowlist, pero no están en `package.json` ni en `package-lock.json` (parece leftover).

## Qué se queda (necesario/útil para funcionalidad)
- Runtime/build:
  - [package.json](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/package.json), [package-lock.json](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/package-lock.json), [tsconfig.json](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/tsconfig.json), [vite.config.ts](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/vite.config.ts) (pero simplificado), [vercel.json](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/vercel.json).
- Estilos/UI:
  - [tailwind.config.ts](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/tailwind.config.ts), [postcss.config.js](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/postcss.config.js).
- DB:
  - [drizzle.config.ts](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/drizzle.config.ts), migrations/.

## Plan de cambios (sin afectar funcionalidad)
1) Limpiar Replit del build
   - Eliminar el archivo `.replit`.
   - Actualizar `vite.config.ts` para quitar:
     - `@replit/vite-plugin-runtime-error-modal`
     - imports dinámicos de cartographer/dev-banner
     - toda lógica ligada a `process.env.REPL_ID`
   - Remover las 3 dependencias `@replit/*` del `package.json` y actualizar `package-lock.json`.

2) Limpiar estado “agent” y evitar que reaparezca
   - Eliminar del repo la carpeta `.local/` (incluyendo `.local/state/replit/agent/*`).
   - Endurecer `.gitignore` para que no se vuelvan a commitear estados locales:
     - ignorar `.local/`
     - ignorar `.replit`
     - (opcional) ignorar otros artefactos locales típicos (logs, tmp), sin tocar `dist`/`dist-server` que ya están contemplados.

3) Remover referencias “AI” residuales (solo ruido)
   - En `script/build.ts`, quitar de la allowlist los entries `openai` y `@google/generative-ai` (y cualquier otro entry que no exista en `package.json`).
   - Mantener el comportamiento actual: en Vercel se sigue saltando el build del server.

4) Revisión extra de “configs innecesarios” (conservadora)
   - Revisar archivos de configuración opcionales para confirmar que no son requeridos por scripts existentes:
     - `components.json` (shadcn/ui). Si no se usa para regenerar componentes, se puede borrar; si se quiere seguir usando shadcn, se deja.
     - `client/requirements.md` y `attached_assets/*.txt` (documentos/artefactos). Se pueden mover a `docs/` o eliminar si son basura.
   - Esto lo haría en una segunda pasada para evitar borrar algo que el equipo sí usa.

## Verificación (antes de cerrar)
- `npm run check`
- `npm test`
- `npm run build:client`
- Smoke local de server (si aplica): `npm run dev` y comprobar `/api/*`.
- Validación en Vercel: verificar `/` y endpoints `/api/categories`, `/api/products`, `/api/testimonials`.

## Criterios de éxito
- El repo ya no contiene `.replit` ni `.local/state/replit/agent/*`.
- `vite.config.ts` no importa ni depende de `@replit/*`.
- El build y tests pasan igual.
- El despliegue en Vercel sigue funcionando igual.
