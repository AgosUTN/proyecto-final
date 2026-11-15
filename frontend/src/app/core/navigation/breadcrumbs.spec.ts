import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { BreadcrumbService } from './breadcrumbs';

@Component({ template: '' })
class Vacio {}

describe('BreadcrumbService', () => {
  let router: Router;
  let servicio: BreadcrumbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: '',
            data: { breadcrumb: { label: 'Vender', link: false } },
            children: [
              {
                path: 'ventas',
                data: { breadcrumb: 'Ventas' },
                children: [
                  { path: '', component: Vacio },
                  {
                    path: ':id',
                    component: Vacio,
                    data: {
                      breadcrumb: (r: { params: Record<string, string> }) =>
                        `Venta ${r.params['id']}`,
                    },
                  },
                ],
              },
            ],
          },
          {
            path: 'admin',
            children: [
              {
                path: 'usuarios',
                data: { breadcrumb: 'Usuarios' },
                children: [
                  { path: '', component: Vacio },
                  { path: 'nuevo', component: Vacio, data: { breadcrumb: 'Nuevo usuario' } },
                ],
              },
            ],
          },
        ]),
      ],
    });
    router = TestBed.inject(Router);
    servicio = TestBed.inject(BreadcrumbService);
  });

  it('el grupo no es navegable y la página actual tampoco', async () => {
    await router.navigateByUrl('/ventas');
    expect(servicio.items()).toEqual([
      { label: 'Vender', url: null },
      { label: 'Ventas', url: null },
    ]);
  });

  it('las migas intermedias son navegables y aceptan etiquetas dinámicas', async () => {
    await router.navigateByUrl('/ventas/V-00412');
    expect(servicio.items()).toEqual([
      { label: 'Vender', url: null },
      { label: 'Ventas', url: '/ventas' },
      { label: 'Venta V-00412', url: null },
    ]);
  });

  it('el hijo con path vacío no hereda la miga del padre (sin breadcrumb: "")', async () => {
    await router.navigateByUrl('/ventas');
    expect(servicio.items().filter((i) => i.label === 'Ventas')).toHaveLength(1);
  });

  it('conserva los segmentos de un padre sin miga en la URL de los hijos', async () => {
    await router.navigateByUrl('/admin/usuarios/nuevo');
    expect(servicio.items()).toEqual([
      { label: 'Usuarios', url: '/admin/usuarios' },
      { label: 'Nuevo usuario', url: null },
    ]);
  });
});
