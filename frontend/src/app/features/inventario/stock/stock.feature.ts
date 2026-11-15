import { FeatureDef } from '@core/navigation/feature.types';

export const stockFeature: FeatureDef = {
  ruta: 'inventario/stock',
  rutas: () => import('./stock.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/inventario/stock',
      etiqueta: 'Stock y variantes',
      grupo: 'Inventario',
      permiso: 'stock:leer',
      orden: 20,
    },
  ],
};
