import { FeatureDef } from '@core/navigation/feature.types';

export const devolucionesFeature: FeatureDef = {
  ruta: 'ventas/devoluciones',
  rutas: () => import('./devoluciones.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/ventas/devoluciones',
      etiqueta: 'Devoluciones',
      grupo: 'Ventas',
      permiso: 'devoluciones:registrar',
      orden: 60,
    },
  ],
};
