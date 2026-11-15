import type { DefinicionError } from '../../shared/http/api-error';

export const ERRORES = {
  NOMBRE_DUPLICADO: {
    status: 409,
    code: 'CATEGORIA_NOMBRE_DUPLICADO',
    mensaje: 'Ya existe una categoría con ese nombre en el mismo nivel.',
  },
  CON_SUBCATEGORIAS: {
    status: 409,
    code: 'CATEGORIA_CON_SUBCATEGORIAS',
    mensaje: 'La categoría tiene subcategorías y no puede eliminarse.',
  },
  CICLO: {
    status: 409,
    code: 'CATEGORIA_CICLO',
    mensaje: 'La categoría no puede depender de sí misma ni de una subcategoría propia.',
  },
} as const satisfies Record<string, DefinicionError>;
