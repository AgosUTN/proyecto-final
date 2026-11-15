import { FeatureDef } from '@core/navigation/feature.types';

export const recepcionesFeature: FeatureDef = {
  ruta: 'inventario/recepciones',
  rutas: () => import('./recepciones.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/inventario/recepciones',
      etiqueta: 'Recepciones',
      grupo: 'Inventario',
      permiso: 'recepciones:registrar',
      orden: 40,
    },
  ],
  permisos: {
    'recepciones:registrar': ['GERENTE', 'OPERARIO_DEPOSITO'],
    'recepciones:resolver': ['GERENTE', 'ADMINISTRATIVO'],
  },
};
