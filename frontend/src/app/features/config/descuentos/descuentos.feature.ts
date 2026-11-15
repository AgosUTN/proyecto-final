import { FeatureDef } from '@core/navigation/feature.types';

export const descuentosFeature: FeatureDef = {
  ruta: 'config/descuentos',
  rutas: () => import('./descuentos.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/config/descuentos',
      etiqueta: 'Descuentos',
      grupo: 'Configuración',
      permiso: 'descuentos:editar',
      orden: 30,
    },
  ],
  permisos: {
    'descuentos:editar': ['GERENTE'],
  },
};
