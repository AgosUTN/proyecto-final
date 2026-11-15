import { FeatureDef } from '@core/navigation/feature.types';

export const prediccionFeature: FeatureDef = {
  ruta: 'analisis/prediccion',
  rutas: () => import('./prediccion.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/analisis/prediccion',
      etiqueta: 'Pronóstico de demanda',
      grupo: 'Análisis',
      permiso: 'analisis:leer',
      orden: 10,
    },
  ],
  permisos: {
    'analisis:leer': ['GERENTE', 'ADMINISTRATIVO'],
  },
};
