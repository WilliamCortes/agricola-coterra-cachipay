## Objetivo
- Eliminar comentarios y líneas de código comentadas en todo el proyecto.
- No cambiar comportamiento ni funcionalidad.
- Si queda algún comentario, que sea mínimo y solo en inglés (idealmente cero).

## Alcance (archivos detectados con comentarios / JSX comments)
- Backend:
  - [server/routes.ts](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/server/routes.ts) (incluye código comentado de `seedDatabase`).
  - [server/index.ts](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/server/index.ts)
  - [server/static.ts](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/server/static.ts)
  - [server/vite.ts](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/server/vite.ts)
- Frontend:
  - [client/src/pages/Home.tsx](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/client/src/pages/Home.tsx)
  - [client/src/pages/Products.tsx](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/client/src/pages/Products.tsx)
  - [client/src/pages/Contact.tsx](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/client/src/pages/Contact.tsx)
  - [client/src/components/Navbar.tsx](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/client/src/components/Navbar.tsx)
  - [client/src/components/Footer.tsx](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/client/src/components/Footer.tsx)
  - [client/src/components/ui/sidebar.tsx](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/client/src/components/ui/sidebar.tsx)
  - [client/src/components/ui/button.tsx](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/client/src/components/ui/button.tsx)
  - [client/src/hooks/use-store.ts](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/client/src/hooks/use-store.ts)
  - [client/src/hooks/use-toast.ts](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/client/src/hooks/use-toast.ts)
  - [client/src/index.css](file:///w:/William/AI/Forest-Elemental/Forest-Elemental/client/src/index.css)
  - (y cualquier otro archivo adicional que aparezca al re-escanear con `//` y `/* */`).

## Cambios a aplicar (archivo por archivo)
1) Quitar código comentado (prioridad alta)
- Eliminar el bloque comentado en `server/routes.ts` que envuelve `seedDatabase()`.

2) Quitar comentarios de línea y de bloque
- Remover comentarios `// ...` en TS/TSX.
- Remover comentarios de bloque `/* ... */` en CSS.

3) Quitar comentarios JSX
- Remover todos los `{/* ... */}` (por ejemplo en `Home.tsx`, `Products.tsx`, `Contact.tsx`, `Navbar.tsx`, `Footer.tsx`, `sidebar.tsx`).

4) Normalización mínima de formato
- Dejar espacios/line breaks coherentes tras borrar comentarios (sin refactor de lógica).

## Verificación
- `npm run check`
- `npm test`
- `npm run build:client`
- (Opcional) smoke de arranque local si el puerto está libre.

## Criterios de éxito
- No quedan líneas de “código comentado”.
- No quedan comentarios innecesarios.
- El typecheck, tests y build siguen pasando.