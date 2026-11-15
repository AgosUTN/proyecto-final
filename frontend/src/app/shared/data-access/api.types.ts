/**
 * Formas comunes de las respuestas de la API (convenciones de la API, sección 3.2). Viven en `shared` porque las
 * usan `crudApi` y las features, y `shared` no puede importar `core` (arquitectura-frontend.md, sección 5.3).
 */

/** Respuesta de obtener, crear, editar o una acción de negocio. */
export interface Respuesta<T> {
  datos: T;
}

/** Respuesta de un listado paginado. */
export interface Paginado<T> {
  datos: T[];
  total: number;
  pagina: number;
  tamanio: number;
}

/** Baja aplicada por un `DELETE`: física (se eliminó) o lógica (se desactivó). */
export interface Baja {
  baja: 'fisica' | 'logica';
}
