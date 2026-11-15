---
paths:
  - "frontend/**"
---

# Frontend

Documentos obligatorios. Se cargan con este archivo y, ante cualquier duda, mandan sobre este resumen:

- Arquitectura (estructura, dependencias, datos, seguridad, convenciones): @../../frontend/docs/arquitectura-frontend.md
- Sistema de diseño (identidad visual, tokens, componentes, patrones de pantalla): @../../frontend/docs/design-system.md
- Mockups de referencia: `frontend/docs/mockups/`. Abrir el que corresponda al patrón de la pantalla. Sus datos y
  textos son ilustrativos: no se copian.

## Reglas

- Una sola identidad visual. Solo tokens `var(--…)` y componentes de `src/app/shared/ui`. Si falta un componente,
  se agrega a `shared/ui` y a la guía `/sistema`; nunca una variante local dentro de una feature.
- Estructura y dependencias según la arquitectura (5.2 y 5.3), con los aliases `@core`, `@shared`, `@features`,
  `@layout`.
- Feature nueva: `<feature>.feature.ts`, `<feature>.routes.ts` y una línea en `app.features.ts`. Las features sin
  implementar muestran `PaginaPendiente`; al implementarlas se reemplaza esa ruta por la página real.
- La aplicación no usa zone.js: estado con signals, componentes `OnPush`, `input()`/`output()`/`model()`.
- No modificar la lógica de negocio ni los contratos de la API. Sin datos de prueba en las pantallas.
- No agregar dependencias sin acordarlo. Hoy la única librería de interfaz es `@angular/cdk`.
- Textos de interfaz según las reglas de `CLAUDE.md` de la raíz.

## Antes de dar una tarea por terminada

Desde `frontend/`:

1. `npx ng build` y `npx ng test --watch=false` sin errores ni advertencias nuevas.
2. Sin colores fuera de los tokens:
   `grep -rnE "#[0-9a-fA-F]{3,8}\b|rgba?\(" src --include=*.ts --include=*.html --include=*.scss | grep -v _tokens.scss`
   (la única excepción es `theme-color` en `index.html`).
3. Si cambió `shared/ui`, actualizar `/sistema` y `design-system.md`.
4. Resumir qué se agregó y qué quedó pendiente.
