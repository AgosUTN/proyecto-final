import { FeatureDef } from '@core/navigation/feature.types';

export const panelFeature: FeatureDef = {
  ruta: 'panel',
  rutas: () => import('./panel.routes').then((m) => m.default),
  nav: [{ ruta: '/panel', etiqueta: 'Panel', permiso: 'panel:leer', orden: 0 }],
  permisos: {
    'panel:leer': ['GERENTE', 'VENDEDOR', 'OPERARIO_DEPOSITO', 'ADMINISTRATIVO'],
  },
};
