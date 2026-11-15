import { Component, Injector, runInInjectionContext } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, convertToParamMap, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { firstValueFrom } from 'rxjs';
import { crudApi } from './crud-api';
import { PageQuerySignal, consultaDesdeParams, pageQueryDesdeUrl, paramsDeConsulta } from './page-query';

@Component({ template: '' })
class Listado {
  readonly query: PageQuerySignal = pageQueryDesdeUrl({ orden: 'nombre' });
}

describe('PageQuery', () => {
  it('lee la consulta de los query params y usa los valores por defecto ante lo ausente o inválido', () => {
    const consulta = consultaDesdeParams(
      convertToParamMap({ pagina: '3', tamanio: '500', direccion: 'desc', q: 'taza', padreId: '4' }),
      { orden: 'nombre' },
    );
    expect(consulta).toEqual({
      pagina: 3,
      tamanio: 25,
      orden: 'nombre',
      direccion: 'desc',
      q: 'taza',
      filtros: { padreId: '4' },
    });
  });

  it('arma los parámetros de la API sin valores vacíos', () => {
    expect(
      paramsDeConsulta({ pagina: 1, tamanio: 25, orden: 'nombre', q: ' ', filtros: { raiz: 'true', padreId: '' } }),
    ).toEqual({ pagina: 1, tamanio: 25, orden: 'nombre', raiz: 'true' });
  });

  it('se sincroniza con la URL y vuelve a la página 1 al cambiar la búsqueda', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'lista', component: Listado }])] });
    const harness = await RouterTestingHarness.create();
    const listado = await harness.navigateByUrl('/lista?pagina=4', Listado);
    expect(listado.query().pagina).toBe(4);

    listado.query.actualizar({ q: 'copa' });
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/lista?q=copa');
    expect(listado.query()).toMatchObject({ pagina: 1, q: 'copa', orden: 'nombre' });

    listado.query.actualizar({ pagina: 2 });
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/lista?pagina=2&q=copa');
  });
});

describe('crudApi', () => {
  it('usa la URL lógica del recurso y desenvuelve { datos }', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const api = runInInjectionContext(TestBed.inject(Injector), () =>
      crudApi<{ nombre: string }, { id: number }, { nombre: string }, { id: number }>('categorias'),
    );
    const backend = TestBed.inject(HttpTestingController);

    expect(api.listarUrl({ pagina: 2, tamanio: 10, q: 'coc' })).toEqual({
      url: 'categorias',
      params: { pagina: 2, tamanio: 10, q: 'coc' },
    });

    const creada = firstValueFrom(api.crear({ nombre: 'Cocina' }));
    const alta = backend.expectOne('categorias');
    expect(alta.request.method).toBe('POST');
    alta.flush({ datos: { id: 7 } });
    expect(await creada).toEqual({ id: 7 });

    const baja = firstValueFrom(api.eliminar(7));
    backend.expectOne({ method: 'DELETE', url: 'categorias/7' }).flush({ datos: { baja: 'fisica' } });
    expect(await baja).toEqual({ baja: 'fisica' });
    backend.verify();
  });
});
