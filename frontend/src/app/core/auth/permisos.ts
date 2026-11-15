/**
 * Catálogo de permisos del sistema (arquitectura-frontend.md, sección 5.6). Los componentes, los guards y el menú
 * preguntan por permisos, nunca por roles: los roles los crea el administrador y los permisos del usuario llegan en
 * `/api/auth/me`.
 *
 * Debe coincidir con `backend/src/shared/auth/permisos.ts` hasta que los tipos se generen desde el contrato OpenAPI
 * (sección 5.10), que ya expone esta lista.
 */
export type Permiso =
  | 'panel:leer'
  | 'ventas:registrar'
  | 'ventas:leer'
  | 'ventas:cancelar'
  | 'mayoristas:administrar'
  | 'devoluciones:registrar'
  | 'devoluciones:verificar'
  | 'devoluciones:evaluar'
  | 'pedidos:gestionar'
  | 'stock:leer'
  | 'stock:ajustar'
  | 'productos:leer'
  | 'productos:editar'
  | 'precios:editar'
  | 'descuentos:editar'
  | 'recepciones:registrar'
  | 'recepciones:resolver'
  | 'compras:gestionar'
  | 'proveedores:gestionar'
  | 'analisis:leer'
  | 'auditoria:leer'
  | 'usuarios:administrar'
  | 'parametros:editar';
