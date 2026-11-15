import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiBaseInterceptor } from './api-base.interceptor';
import { ApiError, SIN_CONEXION } from './api-error';
import { credentialsInterceptor } from './credentials.interceptor';
import { errorInterceptor } from './error.interceptor';

describe('Interceptors HTTP', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(
          withInterceptors([apiBaseInterceptor, credentialsInterceptor, errorInterceptor]),
        ),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('antepone /api a las URLs lógicas y envía credenciales', () => {
    http.get('categorias').subscribe();
    const req = backend.expectOne('/api/categorias');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('antepone /ds-api al prefijo ds: y no toca las URLs con barra inicial', () => {
    http.get('ds:pronostico').subscribe();
    http.get('/fonts/lista.json').subscribe();
    backend.expectOne('/ds-api/pronostico').flush({});
    backend.expectOne('/fonts/lista.json').flush({});
  });

  it('convierte la respuesta de error en ApiError con sus campos', async () => {
    const respuesta = firstValueFrom(http.post('categorias', {}));
    backend.expectOne('/api/categorias').flush(
      {
        status: 409,
        code: 'CATEGORIA_NOMBRE_DUPLICADO',
        mensaje: 'x',
        campos: { nombre: 'CATEGORIA_NOMBRE_DUPLICADO' },
      },
      { status: 409, statusText: 'Conflict' },
    );
    const error = await respuesta.catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 409,
      code: 'CATEGORIA_NOMBRE_DUPLICADO',
      campos: { nombre: 'CATEGORIA_NOMBRE_DUPLICADO' },
    });
  });

  it('informa SIN_CONEXION si la solicitud no llega al servidor', async () => {
    const respuesta = firstValueFrom(http.get('categorias'));
    backend.expectOne('/api/categorias').error(new ProgressEvent('error'));
    expect(await respuesta.catch((e: unknown) => e)).toMatchObject({ status: 0, code: SIN_CONEXION });
  });

  it('lleva a /sin-permiso ante un 403', async () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const respuesta = firstValueFrom(http.get('categorias'));
    backend
      .expectOne('/api/categorias')
      .flush({ status: 403, code: 'SIN_PERMISO', mensaje: 'x' }, { status: 403, statusText: 'Forbidden' });
    await respuesta.catch(() => undefined);
    expect(navegar).toHaveBeenCalledWith(['/sin-permiso']);
  });
});
