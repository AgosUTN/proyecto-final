import { Router } from 'express';
import { requirePermission } from '../../shared/auth/require-permission';
import { ERRORES_GENERALES } from '../../shared/http/api-error';
import { idParamsSchema, validar } from '../../shared/http/validar';
import { bajaDto, respuestaDatos, respuestaPagina } from '../../shared/openapi/esquemas';
import type { DocRuta } from '../../shared/openapi/tipos';
import { controller } from './categorias.controller';
import { categoriaDetalleDto, categoriaFilaDto } from './categorias.dto';
import { ERRORES } from './categorias.errors';
import { categoriaAltaSchema, categoriaEdicionSchema, categoriaPaginaSchema } from './categorias.schemas';

export const categoriasRouter = Router();

categoriasRouter.get(
  '/',
  requirePermission('parametros:editar'),
  validar({ query: categoriaPaginaSchema }),
  controller.listar,
);
categoriasRouter.get(
  '/:id',
  requirePermission('parametros:editar'),
  validar({ params: idParamsSchema }),
  controller.obtener,
);
categoriasRouter.post(
  '/',
  requirePermission('parametros:editar'),
  validar({ body: categoriaAltaSchema }),
  controller.crear,
);
categoriasRouter.put(
  '/:id',
  requirePermission('parametros:editar'),
  validar({ params: idParamsSchema, body: categoriaEdicionSchema }),
  controller.actualizar,
);
categoriasRouter.delete(
  '/:id',
  requirePermission('parametros:editar'),
  validar({ params: idParamsSchema }),
  controller.eliminar,
);

export const categoriasOpenApi: DocRuta[] = [
  {
    metodo: 'get',
    ruta: '/',
    resumen: 'Listar categorías',
    descripcion: 'Búsqueda por nombre (`q`). Las categorías inactivas se omiten salvo con `incluirInactivos=true`.',
    permiso: 'parametros:editar',
    query: categoriaPaginaSchema,
    respuesta: { status: 200, descripcion: 'Página de categorías.', esquema: respuestaPagina(categoriaFilaDto) },
  },
  {
    metodo: 'get',
    ruta: '/:id',
    resumen: 'Obtener una categoría',
    permiso: 'parametros:editar',
    params: idParamsSchema,
    respuesta: { status: 200, descripcion: 'Detalle de la categoría.', esquema: respuestaDatos(categoriaDetalleDto) },
  },
  {
    metodo: 'post',
    ruta: '/',
    resumen: 'Crear una categoría',
    descripcion: 'Con `padreId` nulo se crea una categoría raíz (RNS-CAT-02); si no, el padre debe existir (RNS-CAT-08).',
    permiso: 'parametros:editar',
    body: categoriaAltaSchema,
    respuesta: { status: 201, descripcion: 'Categoría creada.', esquema: respuestaDatos(categoriaDetalleDto) },
    errores: [ERRORES.NOMBRE_DUPLICADO, ERRORES_GENERALES.NO_ENCONTRADO],
  },
  {
    metodo: 'put',
    ruta: '/:id',
    resumen: 'Editar una categoría',
    descripcion: 'Recibe el formulario completo. El padre no puede ser la propia categoría ni una descendiente (RNS-CAT-04/14).',
    permiso: 'parametros:editar',
    params: idParamsSchema,
    body: categoriaEdicionSchema,
    respuesta: { status: 200, descripcion: 'Categoría actualizada.', esquema: respuestaDatos(categoriaDetalleDto) },
    errores: [ERRORES.NOMBRE_DUPLICADO, ERRORES.CICLO],
  },
  {
    metodo: 'delete',
    ruta: '/:id',
    resumen: 'Eliminar una categoría',
    descripcion:
      'Baja física si ningún producto la referencia; baja lógica si alguno la referencia (RNS-CAT-10). Con ' +
      'subcategorías no puede eliminarse (RNS-CAT-09).',
    permiso: 'parametros:editar',
    params: idParamsSchema,
    respuesta: { status: 200, descripcion: 'Tipo de baja aplicada.', esquema: respuestaDatos(bajaDto) },
    errores: [ERRORES.CON_SUBCATEGORIAS],
  },
];
