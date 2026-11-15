import { FeatureDef } from '@core/navigation/feature.types';

/** Guía viva del sistema de diseño. Solo se registra en desarrollo (app.features.ts). */
export const sistemaFeature: FeatureDef = {
  ruta: 'sistema',
  rutas: () => import('./sistema.routes').then((m) => m.default),
};
