import { FeatureDef } from '@core/navigation/feature.types';

export const facturacionFeature: FeatureDef = {
  ruta: 'ventas/facturacion',
  rutas: () => import('./facturacion.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/ventas/facturacion',
      etiqueta: 'Facturación',
      grupo: 'Ventas',
      permiso: 'ventas:leer',
      orden: 70,
    },
  ],
  permisos: {
    'ventas:leer': ['GERENTE', 'VENDEDOR', 'ADMINISTRATIVO'],
  },
};
