---
paths:
  - "backend/**"
---

# Backend

Documento obligatorio. Se carga con este archivo y, ante cualquier duda, manda sobre este resumen:
@../../backend/docs/convenciones-api.md

## Reglas

- Cada recurso es un módulo en `backend/src/modules/<modulo>/` con sus ocho archivos: entity, routes, schemas,
  dto, mapper, service, controller y errors (convenciones, sección 2).
- Rutas siempre con `requirePermission(...)` y `validar({ params, body, query })`. Lo validado se lee de
  `res.locals.validado`; nunca se reasigna `req.query`.
- Controladores sin `try/catch` ni acceso al ORM. Servicios sin `req` ni `res`. Las respuestas pasan siempre por
  el mapper; ningún controlador devuelve una entidad.
- Errores de negocio con `throw new ApiError(ERRORES.X)` desde el servicio, declarados en `<modulo>.errors.ts`.
  El formato de error lo arma solo el manejador central.
- Reglas de negocio citadas por su código (RNS-…) en el servicio y en el nombre de su test.
- Un módulo usa a otro a través de su servicio; nunca escribe sobre entidades ajenas.
- Esquema de base de datos solo con migraciones. Montos en centavos dentro del servicio.
- No modificar `frontend/`. No agregar dependencias sin acordarlo.
- Mensajes de error y commits según `CLAUDE.md` de la raíz.

## Antes de dar una tarea por terminada

Desde `backend/`:

1. Build sin errores y tests en verde.
2. Todas las rutas nuevas documentadas en OpenAPI (el test de documentación pasa).
3. Recorrer la definición de terminado de la sección 13 de las convenciones.
4. Resumir qué se agregó, qué cambió en el contrato (para regenerar los tipos del frontend) y qué quedó pendiente.
