import type { ZodObject, ZodType } from 'zod';
import type { DefinicionError } from '../http/api-error';

export type MetodoHttp = 'get' | 'post' | 'put' | 'patch' | 'delete';

/** Documentación de una ruta. Cada `*.routes.ts` exporta la lista de las suyas junto con su router. */
export interface DocRuta {
  metodo: MetodoHttp;
  /** Ruta relativa al módulo, con la sintaxis de Express: `/`, `/:id`. */
  ruta: string;
  resumen: string;
  descripcion?: string;
  /** Permiso que exige la ruta. Sin permiso, la ruta solo exige sesión, salvo que sea `publica`. */
  permiso?: string;
  publica?: boolean;
  params?: ZodObject;
  query?: ZodObject;
  body?: ZodType;
  respuesta: { status: number; descripcion: string; esquema?: ZodType };
  /** Errores de negocio que puede devolver la ruta. Los comunes (400, 401, 403, 404, 500) se agregan solos. */
  errores?: DefinicionError[];
}

/** Conjunto de rutas documentadas bajo un mismo prefijo (un módulo o las rutas propias de la app). */
export interface GrupoDocumentado {
  prefijo: string;
  etiqueta: string;
  rutas: DocRuta[];
}
