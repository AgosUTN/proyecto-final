import { FeatureDef } from '@core/navigation/feature.types';

export const ordenesFeature: FeatureDef = {
  ruta: 'compras/ordenes',
  rutas: () => import('./ordenes.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/compras/ordenes',
      etiqueta: 'Órdenes de compra',
      grupo: 'Compras',
      permiso: 'compras:gestionar',
      orden: 10,
    },
  ],
  permisos: {
    'compras:gestionar': ['GERENTE', 'ADMINISTRATIVO'],
  },
};
