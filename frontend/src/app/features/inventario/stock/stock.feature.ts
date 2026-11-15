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
  permisos: {
    'stock:leer': ['GERENTE', 'VENDEDOR', 'OPERARIO_DEPOSITO', 'ADMINISTRATIVO'],
    'stock:ajustar': ['GERENTE', 'OPERARIO_DEPOSITO'],
  },
};
