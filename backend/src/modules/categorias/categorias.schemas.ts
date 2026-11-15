import { z } from 'zod';
import { esquemaPagina, filtroInactivos } from '../../shared/http/paginacion';

const campos = {
  nombre: z.string().trim().min(1).max(80),
  descripcion: z.string().trim().min(1).max(255),
  /** `null` crea una categoría raíz (RNS-CAT-02). */
  padreId: z.number().int().positive().nullable(),
};

export const categoriaAltaSchema = z.object(campos).strict().meta({ id: 'CategoriaAlta' });
export type CategoriaAltaDto = z.infer<typeof categoriaAltaSchema>;

/** Formulario completo de edición (convenciones, sección 3.2). */
export const categoriaEdicionSchema = z.object(campos).strict().meta({ id: 'CategoriaEdicion' });
export type CategoriaEdicionDto = z.infer<typeof categoriaEdicionSchema>;

export const categoriaPaginaSchema = esquemaPagina({
  ordenables: ['nombre', 'id'],
  filtros: {
    ...filtroInactivos,
    /** Solo las subcategorías directas de esa categoría. */
    padreId: z.coerce.number().int().positive().optional(),
    /** `true`: solo las categorías raíz. */
    raiz: z.stringbool().optional(),
  },
});
export type CategoriaPaginaDto = z.infer<typeof categoriaPaginaSchema>;
