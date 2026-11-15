import { FeatureDef } from '@core/navigation/feature.types';

export const productosFeature: FeatureDef = {
  ruta: 'inventario/productos',
  rutas: () => import('./productos.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/inventario/productos',
      etiqueta: 'Productos',
      grupo: 'Inventario',
      permiso: 'productos:leer',
      orden: 10,
    },
  ],
  permisos: {
    'productos:leer': ['GERENTE', 'VENDEDOR', 'OPERARIO_DEPOSITO', 'ADMINISTRATIVO'],
    'productos:editar': ['GERENTE'],
    'precios:editar': ['GERENTE'],
  },
};
