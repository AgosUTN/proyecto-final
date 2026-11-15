import type { Categoria } from './categoria.entity';
import type { CategoriaDetalleDto, CategoriaFilaDto } from './categorias.dto';

/** Requiere `padre` cargado; el detalle requiere además `subcategorias`. */
export const CategoriaMapper = {
  fila: (c: Categoria): CategoriaFilaDto => ({
    id: c.id,
    nombre: c.nombre,
    padre: c.padre?.nombre ?? null,
    activo: c.activo,
  }),
  detalle: (c: Categoria): CategoriaDetalleDto => ({
    ...CategoriaMapper.fila(c),
    descripcion: c.descripcion,
    padreId: c.padre?.id ?? null,
    subcategorias: c.subcategorias.count(),
  }),
};
