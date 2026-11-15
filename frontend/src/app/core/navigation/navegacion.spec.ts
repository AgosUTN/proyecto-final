import { FeatureDef } from './feature.types';
import { construirMenu } from './navegacion';

const feature = (nav: FeatureDef['nav']): FeatureDef => ({
  ruta: 'x',
  rutas: async () => [],
  nav,
});

describe('construirMenu', () => {
  it('agrupa en el orden de GRUPOS_NAV, ordena por `orden` y deja primero los ítems sin grupo', () => {
    const menu = construirMenu([
      feature([
        { ruta: '/b', etiqueta: 'B', grupo: 'Inventario', permiso: 'stock:leer', orden: 20 },
      ]),
      feature([
        { ruta: '/a', etiqueta: 'A', grupo: 'Inventario', permiso: 'stock:leer', orden: 10 },
      ]),
      feature([{ ruta: '/v', etiqueta: 'V', grupo: 'Ventas', permiso: 'ventas:leer', orden: 10 }]),
      feature([{ ruta: '/panel', etiqueta: 'Panel', permiso: 'panel:leer', orden: 0 }]),
      feature(undefined),
    ]);
    expect(menu.map((g) => g.grupo)).toEqual([null, 'Ventas', 'Inventario']);
    expect(menu[2].items.map((i) => i.etiqueta)).toEqual(['A', 'B']);
  });

  it('deja solo los ítems cuyo permiso tiene el usuario y omite los grupos vacíos', () => {
    const menu = construirMenu(
      [
        feature([{ ruta: '/s', etiqueta: 'S', grupo: 'Inventario', permiso: 'stock:leer', orden: 10 }]),
        feature([{ ruta: '/v', etiqueta: 'V', grupo: 'Ventas', permiso: 'ventas:leer', orden: 10 }]),
      ],
      (permiso) => permiso === 'stock:leer',
    );
    expect(menu).toEqual([{ grupo: 'Inventario', items: [expect.objectContaining({ etiqueta: 'S' })] }]);
  });
});
