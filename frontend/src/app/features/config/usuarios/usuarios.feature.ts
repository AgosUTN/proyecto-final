import { FeatureDef } from '@core/navigation/feature.types';

export const usuariosFeature: FeatureDef = {
  ruta: 'config/usuarios',
  rutas: () => import('./usuarios.routes').then((m) => m.default),
  nav: [
    {
      ruta: '/config/usuarios',
      etiqueta: 'Usuarios y roles',
      grupo: 'Configuración',
      permiso: 'usuarios:administrar',
      orden: 10,
    },
  ],
  permisos: {
    'usuarios:administrar': ['GERENTE'],
  },
};
