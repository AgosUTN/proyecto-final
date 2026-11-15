import { Component } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { apiBaseInterceptor } from '@core/http/api-base.interceptor';
import { errorInterceptor } from '@core/http/error.interceptor';
import { AuthStore } from './auth.store';
import { authGuard, invitadoGuard } from './auth.guard';
import { Can } from './can.directive';
import { permissionGuard } from './permission.guard';

const USUARIO = { id: 1, nombre: 'admin', rol: 'Administrador', permisos: ['parametros:editar' as const] };

@Component({
  imports: [Can],
  template: `<span *can="'parametros:editar'">editar</span><span *can="'stock:ajustar'">ajustar</span>`,
})
class ConPermisos {}

describe('Sesión', () => {
  let store: AuthStore;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiBaseInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    store = TestBed.inject(AuthStore);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  async function cargar(respuesta: 'ok' | 'sin-sesion'): Promise<void> {
    const carga = store.cargarSesion();
    const req = backend.expectOne('/api/auth/me');
    if (respuesta === 'ok') req.flush({ datos: USUARIO });
    else req.flush({ status: 401, code: 'SESION_INVALIDA', mensaje: 'x' }, { status: 401, statusText: 'Unauthorized' });
    await carga;
  }

  const ejecutar = (guard: ReturnType<typeof permissionGuard>, url = '/config/categorias') =>
    TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );

  it('carga el usuario y sus permisos desde /api/auth/me', async () => {
    await cargar('ok');
    expect(store.autenticado()).toBe(true);
    expect(store.puede('parametros:editar')).toBe(true);
    expect(store.puede('stock:ajustar')).toBe(false);
  });

  it('queda como anónimo sin sesión válida, sin redirigir', async () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate');
    await cargar('sin-sesion');
    expect(store.autenticado()).toBe(false);
    expect(navegar).not.toHaveBeenCalled();
  });

  it('authGuard lleva al login conservando la ruta pedida', async () => {
    await cargar('sin-sesion');
    const resultado = ejecutar(authGuard) as UrlTree;
    expect(resultado.toString()).toBe('/login?volver=%2Fconfig%2Fcategorias');
  });

  it('invitadoGuard lleva al panel si ya hay sesión', async () => {
    await cargar('ok');
    expect((ejecutar(invitadoGuard) as UrlTree).toString()).toBe('/panel');
  });

  it('permissionGuard deja pasar con el permiso y lleva a /sin-permiso sin él', async () => {
    await cargar('ok');
    expect(ejecutar(permissionGuard('parametros:editar'))).toBe(true);
    expect((ejecutar(permissionGuard('stock:ajustar')) as UrlTree).toString()).toBe('/sin-permiso');
  });

  it('ante una sesión vencida limpia el store y lleva al login', async () => {
    await cargar('ok');
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    TestBed.inject(HttpClient).get('categorias').subscribe({ error: () => undefined });
    backend
      .expectOne('/api/categorias')
      .flush({ status: 401, code: 'SESION_INVALIDA', mensaje: 'x' }, { status: 401, statusText: 'Unauthorized' });
    expect(store.autenticado()).toBe(false);
    expect(navegar).toHaveBeenCalledWith(['/login'], { queryParams: { volver: '/' } });
  });

  it('*can muestra solo el contenido permitido', async () => {
    await cargar('ok');
    const fixture = TestBed.createComponent(ConPermisos);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toBe('editar');
  });
});

