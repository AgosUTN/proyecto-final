import { FeatureDef } from '@core/navigation/feature.types';

export const mostradorFeature: FeatureDef = {
  ruta: 'ventas/mostrador',
  rutas: () => import('./mostrador.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/ventas/mostrador',
      etiqueta: 'Venta en mostrador',
      grupo: 'Ventas',
      permiso: 'ventas:registrar',
      orden: 10,
    },
  ],
};
