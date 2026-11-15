import { FeatureDef } from '@core/navigation/feature.types';

export const reportesFeature: FeatureDef = {
  ruta: 'analisis/reportes',
  rutas: () => import('./reportes.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/analisis/reportes',
      etiqueta: 'Reportes',
      grupo: 'Análisis',
      permiso: 'analisis:leer',
      orden: 20,
    },
  ],
  permisos: {
    'analisis:leer': ['GERENTE', 'ADMINISTRATIVO'],
  },
};
