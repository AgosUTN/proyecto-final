import { z } from 'zod';

/**
 * Catálogo de permisos del sistema: los que exigen los endpoints (convenciones, sección 6.3). Es la misma lista que
 * usa el frontend (tipo `Permiso` de `frontend/src/app/core/auth/roles.ts`). Qué permisos tiene cada rol no se define
 * en código: lo decide el administrador al crear el rol (`ROL.permisos`).
 */
export const PERMISOS = [
  'panel:leer',
  'ventas:registrar',
  'ventas:leer',
  'ventas:cancelar',
  'mayoristas:administrar',
  'devoluciones:registrar',
  'devoluciones:verificar',
  'devoluciones:evaluar',
  'pedidos:gestionar',
  'stock:leer',
  'stock:ajustar',
  'productos:leer',
  'productos:editar',
  'precios:editar',
  'descuentos:editar',
  'recepciones:registrar',
  'recepciones:resolver',
  'compras:gestionar',
  'proveedores:gestionar',
  'analisis:leer',
  'auditoria:leer',
  'usuarios:administrar',
  'parametros:editar',
] as const;

export type Permiso = (typeof PERMISOS)[number];

export const permisoSchema = z.enum(PERMISOS);

/** Filtra una lista guardada en la base a los permisos vigentes del catálogo. */
export function permisosVigentes(permisos: readonly string[]): Permiso[] {
  return PERMISOS.filter((permiso) => permisos.includes(permiso));
}

/** Permisos que otorga un rol: los vigentes de su lista, o ninguno si el rol está inactivo. */
export function permisosDeRol(rol: { activo: boolean; permisos: readonly string[] }): Permiso[] {
  return rol.activo ? permisosVigentes(rol.permisos) : [];
}
