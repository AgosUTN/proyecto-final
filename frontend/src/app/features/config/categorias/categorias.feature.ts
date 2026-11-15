import { FeatureDef } from '@core/navigation/feature.types';

export const categoriasFeature: FeatureDef = {
  ruta: 'config/categorias',
  rutas: () => import('./categorias.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/config/categorias',
      etiqueta: 'Categorías',
      grupo: 'Configuración',
      permiso: 'parametros:editar',
      orden: 20,
    },
  ],
};
