import { FeatureDef } from '@core/navigation/feature.types';

export const sinRotacionFeature: FeatureDef = {
  ruta: 'inventario/sin-rotacion',
  rutas: () => import('./sin-rotacion.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/inventario/sin-rotacion',
      etiqueta: 'Sin rotación',
      grupo: 'Inventario',
      permiso: 'analisis:leer',
      orden: 30,
    },
  ],
  permisos: {
    'analisis:leer': ['GERENTE', 'ADMINISTRATIVO'],
  },
};
