import type { Router } from 'express';
import type { DocRuta } from '../openapi/tipos';

/** Registro de un módulo en `modules/index.ts`. */
export interface Modulo {
  /** Ruta base bajo `/api`: `/categorias`. */
  ruta: string;
  router: Router;
  /** Documentación OpenAPI de todas las rutas del router. */
  openapi: DocRuta[];
  /** Si es `true`, no se aplica `autenticar` al montar el módulo (solo `auth`). */
  publico?: boolean;
}
