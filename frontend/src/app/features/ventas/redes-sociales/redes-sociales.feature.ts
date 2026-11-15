import { FeatureDef } from '@core/navigation/feature.types';

export const redesSocialesFeature: FeatureDef = {
  ruta: 'ventas/redes-sociales',
  rutas: () => import('./redes-sociales.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/ventas/redes-sociales',
      etiqueta: 'Venta por redes sociales',
      grupo: 'Ventas',
      permiso: 'ventas:registrar',
      orden: 20,
    },
  ],
};
