import { z } from 'zod';

export const categoriaFilaDto = z
  .object({
    id: z.number().int(),
    nombre: z.string(),
    /** Nombre de la categoría padre; nulo en las raíz. */
    padre: z.string().nullable(),
    activo: z.boolean(),
  })
  .meta({ id: 'CategoriaFila' });
export type CategoriaFilaDto = z.infer<typeof categoriaFilaDto>;

export const categoriaDetalleDto = categoriaFilaDto
  .extend({
    descripcion: z.string(),
    padreId: z.number().int().nullable(),
    /** Cantidad de subcategorías directas. */
    subcategorias: z.number().int(),
  })
  .meta({ id: 'CategoriaDetalle' });
export type CategoriaDetalleDto = z.infer<typeof categoriaDetalleDto>;
