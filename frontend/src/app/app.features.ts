import { isDevMode } from '@angular/core';
import { FeatureDef } from '@core/navigation/feature.types';
import { panelFeature } from '@features/panel/panel.feature';
import { mostradorFeature } from '@features/ventas/mostrador/mostrador.feature';
import { redesSocialesFeature } from '@features/ventas/redes-sociales/redes-sociales.feature';
import { historialFeature } from '@features/ventas/historial/historial.feature';
import { facturacionFeature } from '@features/ventas/facturacion/facturacion.feature';
import { pedidosFeature } from '@features/ventas/pedidos/pedidos.feature';
import { mayoristasFeature } from '@features/ventas/mayoristas/mayoristas.feature';
import { devolucionesFeature } from '@features/ventas/devoluciones/devoluciones.feature';
import { productosFeature } from '@features/inventario/productos/productos.feature';
import { stockFeature } from '@features/inventario/stock/stock.feature';
import { sinRotacionFeature } from '@features/inventario/sin-rotacion/sin-rotacion.feature';
import { recepcionesFeature } from '@features/inventario/recepciones/recepciones.feature';
import { ordenesFeature } from '@features/compras/ordenes/ordenes.feature';
import { proveedoresFeature } from '@features/compras/proveedores/proveedores.feature';
import { prediccionFeature } from '@features/analisis/prediccion/prediccion.feature';
import { reportesFeature } from '@features/analisis/reportes/reportes.feature';
import { auditoriaFeature } from '@features/auditoria/auditoria.feature';
import { usuariosFeature } from '@features/config/usuarios/usuarios.feature';
import { categoriasFeature } from '@features/config/categorias/categorias.feature';
import { descuentosFeature } from '@features/config/descuentos/descuentos.feature';
import { parametrosFeature } from '@features/config/parametros/parametros.feature';
import { sistemaFeature } from '@features/sistema/sistema.feature';

/**
 * Único archivo compartido del registro de features: una línea por feature
 * (arquitectura-frontend.md, sección 5.4). El orden no importa: el menú usa `orden`
 * y las rutas se ordenan de la más específica a la más general.
 */
export const FEATURES_APP: FeatureDef[] = [
  panelFeature,
  mostradorFeature,
  redesSocialesFeature,
  historialFeature,
  facturacionFeature,
  pedidosFeature,
  mayoristasFeature,
  devolucionesFeature,
  productosFeature,
  stockFeature,
  sinRotacionFeature,
  recepcionesFeature,
  ordenesFeature,
  proveedoresFeature,
  prediccionFeature,
  reportesFeature,
  auditoriaFeature,
  usuariosFeature,
  categoriasFeature,
  descuentosFeature,
  parametrosFeature,
  ...(isDevMode() ? [sistemaFeature] : []),
];
