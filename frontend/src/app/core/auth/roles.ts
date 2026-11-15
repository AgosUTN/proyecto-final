/**
 * Roles y permisos del sistema (arquitectura-frontend.md, sección 5.6; RNS-ROL-01 de la Etapa 3).
 * Los componentes y guards preguntan por permisos, nunca por roles.
 */
export type RolEmpleado = 'GERENTE' | 'VENDEDOR' | 'OPERARIO_DEPOSITO' | 'ADMINISTRATIVO';
export type RolCliente = 'CLIENTE_MINORISTA' | 'CLIENTE_MAYORISTA';
export type Rol = RolEmpleado | RolCliente;

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

export const EMPLEADOS: RolEmpleado[] = [
  'GERENTE',
  'VENDEDOR',
  'OPERARIO_DEPOSITO',
  'ADMINISTRATIVO',
];
