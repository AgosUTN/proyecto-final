import { FeatureDef } from '@core/navigation/feature.types';

export const mayoristasFeature: FeatureDef = {
  ruta: 'ventas/mayoristas',
  rutas: () => import('./mayoristas.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/ventas/mayoristas',
      etiqueta: 'Clientes mayoristas',
      grupo: 'Ventas',
      permiso: 'mayoristas:administrar',
      orden: 50,
    },
  ],
};
