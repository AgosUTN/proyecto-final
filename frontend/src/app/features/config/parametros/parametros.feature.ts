import { FeatureDef } from '@core/navigation/feature.types';

export const parametrosFeature: FeatureDef = {
  ruta: 'config/parametros',
  rutas: () => import('./parametros.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/config/parametros',
      etiqueta: 'Parámetros',
      grupo: 'Configuración',
      permiso: 'parametros:editar',
      orden: 40,
    },
  ],
  permisos: {
    'parametros:editar': ['GERENTE'],
  },
};
