import { FeatureDef } from '@core/navigation/feature.types';

export const proveedoresFeature: FeatureDef = {
  ruta: 'compras/proveedores',
  rutas: () => import('./proveedores.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/compras/proveedores',
      etiqueta: 'Proveedores',
      grupo: 'Compras',
      permiso: 'proveedores:gestionar',
      orden: 20,
    },
  ],
  permisos: {
    'proveedores:gestionar': ['GERENTE', 'ADMINISTRATIVO'],
  },
};
