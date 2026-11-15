import { FeatureDef } from '@core/navigation/feature.types';

export const pedidosFeature: FeatureDef = {
  ruta: 'ventas/pedidos',
  rutas: () => import('./pedidos.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/ventas/pedidos',
      etiqueta: 'Pedidos',
      grupo: 'Ventas',
      permiso: 'pedidos:gestionar',
      orden: 40,
    },
  ],
  permisos: {
    'pedidos:gestionar': ['GERENTE', 'OPERARIO_DEPOSITO'],
  },
};
