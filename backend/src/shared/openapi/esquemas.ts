import { z, type ZodType } from 'zod';

/** Forma única de las respuestas de error (convenciones, sección 5.1). */
export const apiErrorSchema = z
  .object({
    status: z.number().int(),
    code: z.string(),
    mensaje: z.string(),
    campos: z.record(z.string(), z.string()).optional(),
  })
  .meta({ id: 'ApiError' });

/** Respuesta de obtener, crear, editar, eliminar o una acción de negocio: `{ datos }`. */
export function respuestaDatos<T extends ZodType>(esquema: T) {
  return z.object({ datos: esquema });
}

/** Resultado de un `DELETE`: qué baja se aplicó (convenciones, sección 7.2). */
export const bajaDto = z.object({ baja: z.enum(['fisica', 'logica']) }).meta({ id: 'Baja' });

/** Respuesta de un listado paginado: `{ datos, total, pagina, tamanio }`. */
export function respuestaPagina<T extends ZodType>(fila: T) {
  return z.object({
    datos: z.array(fila),
    total: z.number().int(),
    pagina: z.number().int(),
    tamanio: z.number().int(),
  });
}
