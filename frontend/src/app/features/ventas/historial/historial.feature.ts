import { FeatureDef } from '@core/navigation/feature.types';

export const historialFeature: FeatureDef = {
  ruta: 'ventas',
  rutas: () => import('./historial.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/ventas',
      etiqueta: 'Historial de ventas',
      grupo: 'Ventas',
      permiso: 'ventas:leer',
      orden: 30,
    },
  ],
  permisos: {
    'ventas:leer': ['GERENTE', 'VENDEDOR', 'ADMINISTRATIVO'],
    'ventas:cancelar': ['GERENTE'],
  },
};
