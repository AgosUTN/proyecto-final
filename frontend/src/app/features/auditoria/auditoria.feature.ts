import { FeatureDef } from '@core/navigation/feature.types';

export const auditoriaFeature: FeatureDef = {
  ruta: 'auditoria',
  rutas: () => import('./auditoria.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/auditoria',
      etiqueta: 'Auditoría',
      grupo: 'Configuración',
      permiso: 'auditoria:leer',
      orden: 50,
    },
  ],
  permisos: {
    'auditoria:leer': ['GERENTE'],
  },
};
