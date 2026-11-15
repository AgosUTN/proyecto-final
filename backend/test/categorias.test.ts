import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { Categoria } from '../src/modules/categorias/categoria.entity';
import { usarContextoDePrueba } from './apoyo/contexto';
import { crearUsuario, iniciarSesion, sesionCon } from './apoyo/datos';

const RUTA = '/api/categorias';

describe('Categorías', () => {
  const contexto = usarContextoDePrueba();
  let cookie: string[];

  beforeEach(async () => {
    cookie = await sesionCon(contexto.orm, contexto.app, ['parametros:editar']);
  });

  const crear = (body: Record<string, unknown>) => request(contexto.app).post(RUTA).set('Cookie', cookie).send(body);
  const editar = (id: number, body: Record<string, unknown>) =>
    request(contexto.app).put(`${RUTA}/${id}`).set('Cookie', cookie).send(body);
  const crearCategoria = async (nombre: string, padreId: number | null = null) => {
    const respuesta = await crear({ nombre, descripcion: `Descripción de ${nombre}`, padreId });
    expect(respuesta.status).toBe(201);
    return respuesta.body.datos as { id: number };
  };

  describe('POST /api/categorias', () => {
    it('RNS-CAT-02: crea una categoría raíz sin padre', async () => {
      const respuesta = await crear({ nombre: '  Cocina ', descripcion: 'Artículos de cocina', padreId: null }).expect(201);
      expect(respuesta.body).toEqual({
        datos: {
          id: expect.any(Number),
          nombre: 'Cocina',
          padre: null,
          activo: true,
          descripcion: 'Artículos de cocina',
          padreId: null,
          subcategorias: 0,
        },
      });
    });

    it('RNS-CAT-08: crea una subcategoría con un padre existente', async () => {
      const cocina = await crearCategoria('Cocina');
      const { body } = await crear({ nombre: 'Vajilla', descripcion: 'Platos y fuentes', padreId: cocina.id }).expect(201);
      expect(body.datos).toMatchObject({ padre: 'Cocina', padreId: cocina.id });

      const padre = await request(contexto.app).get(`${RUTA}/${cocina.id}`).set('Cookie', cookie).expect(200);
      expect(padre.body.datos.subcategorias).toBe(1);
    });

    it('RNS-CAT-08: rechaza un padre inexistente con 404 NO_ENCONTRADO', async () => {
      const { body } = await crear({ nombre: 'Vajilla', descripcion: 'Platos', padreId: 999 }).expect(404);
      expect(body.code).toBe('NO_ENCONTRADO');
    });

    it('RNS-CAT-13: rechaza un nombre repetido entre hermanas, sin distinguir mayúsculas ni tildes', async () => {
      await crearCategoria('Decoración');
      const { body } = await crear({ nombre: 'DECORACION', descripcion: 'Otra', padreId: null }).expect(409);
      expect(body).toEqual({
        status: 409,
        code: 'CATEGORIA_NOMBRE_DUPLICADO',
        mensaje: 'Ya existe una categoría con ese nombre en el mismo nivel.',
        campos: { nombre: 'CATEGORIA_NOMBRE_DUPLICADO' },
      });
    });

    it('RNS-CAT-13: admite el mismo nombre en distinto nivel', async () => {
      const cocina = await crearCategoria('Cocina');
      await crearCategoria('Accesorios');
      await crearCategoria('Accesorios', cocina.id);
    });

    it('valida el body', async () => {
      const { body } = await crear({ nombre: 'Cocina', extra: 1 }).expect(400);
      expect(body.campos).toEqual({
        descripcion: 'REQUERIDO',
        padreId: 'REQUERIDO',
        extra: 'CAMPO_NO_PERMITIDO',
      });
    });
  });

  describe('PUT /api/categorias/:id', () => {
    it('actualiza nombre, descripción y padre', async () => {
      const cocina = await crearCategoria('Cocina');
      const bazar = await crearCategoria('Bazar');
      const { body } = await editar(bazar.id, { nombre: 'Bazar general', descripcion: 'Nueva', padreId: cocina.id }).expect(200);
      expect(body.datos).toMatchObject({ nombre: 'Bazar general', descripcion: 'Nueva', padre: 'Cocina', padreId: cocina.id });
    });

    it('RNS-CAT-04/14: rechaza la propia categoría como padre', async () => {
      const cocina = await crearCategoria('Cocina');
      const { body } = await editar(cocina.id, { nombre: 'Cocina', descripcion: 'x', padreId: cocina.id }).expect(409);
      expect(body).toMatchObject({ code: 'CATEGORIA_CICLO', campos: { padreId: 'CATEGORIA_CICLO' } });
    });

    it('RNS-CAT-04/14: rechaza una descendiente como padre', async () => {
      const cocina = await crearCategoria('Cocina');
      const vajilla = await crearCategoria('Vajilla', cocina.id);
      const platos = await crearCategoria('Platos', vajilla.id);
      const { body } = await editar(cocina.id, { nombre: 'Cocina', descripcion: 'x', padreId: platos.id }).expect(409);
      expect(body.code).toBe('CATEGORIA_CICLO');
    });

    it('RNS-CAT-13: rechaza un nombre repetido entre hermanas al editar, pero admite conservar el propio', async () => {
      await crearCategoria('Cocina');
      const bazar = await crearCategoria('Bazar');
      await editar(bazar.id, { nombre: 'Bazar', descripcion: 'Otra descripción', padreId: null }).expect(200);
      const { body } = await editar(bazar.id, { nombre: 'cocina', descripcion: 'x', padreId: null }).expect(409);
      expect(body.code).toBe('CATEGORIA_NOMBRE_DUPLICADO');
    });

    it('responde 404 NO_ENCONTRADO si la categoría no existe', async () => {
      const { body } = await editar(999, { nombre: 'Cocina', descripcion: 'x', padreId: null }).expect(404);
      expect(body.code).toBe('NO_ENCONTRADO');
    });
  });

  describe('DELETE /api/categorias/:id', () => {
    it('aplica baja física a una categoría sin utilizar', async () => {
      const cocina = await crearCategoria('Cocina');
      await request(contexto.app).delete(`${RUTA}/${cocina.id}`).set('Cookie', cookie).expect(200, { datos: { baja: 'fisica' } });
      await request(contexto.app).get(`${RUTA}/${cocina.id}`).set('Cookie', cookie).expect(404);
    });

    it('RNS-CAT-09: rechaza eliminar una categoría con subcategorías', async () => {
      const cocina = await crearCategoria('Cocina');
      await crearCategoria('Vajilla', cocina.id);
      const { body } = await request(contexto.app).delete(`${RUTA}/${cocina.id}`).set('Cookie', cookie).expect(409);
      expect(body).toEqual({
        status: 409,
        code: 'CATEGORIA_CON_SUBCATEGORIAS',
        mensaje: 'La categoría tiene subcategorías y no puede eliminarse.',
      });
    });

    it.todo('RNS-CAT-10: aplica baja lógica a una categoría referenciada por algún producto (requiere Producto)');
  });

  describe('GET /api/categorias', () => {
    beforeEach(async () => {
      const cocina = await crearCategoria('Cocina');
      await crearCategoria('Vajilla', cocina.id);
      await crearCategoria('Bazar');
      const inactiva = await crearCategoria('Discontinuada');
      await contexto.orm.em.fork().nativeUpdate(Categoria, { id: inactiva.id }, { activo: false });
    });

    const listar = (query = '') => request(contexto.app).get(`${RUTA}${query}`).set('Cookie', cookie).expect(200);

    it('pagina, ordena por nombre y oculta las inactivas', async () => {
      const { body } = await listar('?tamanio=2');
      expect(body).toMatchObject({ total: 3, pagina: 1, tamanio: 2 });
      expect(body.datos.map((c: { nombre: string }) => c.nombre)).toEqual(['Bazar', 'Cocina']);
    });

    it('incluye las inactivas con incluirInactivos=true', async () => {
      const { body } = await listar('?incluirInactivos=true&orden=nombre&direccion=desc');
      expect(body.total).toBe(4);
      expect(body.datos[0]).toMatchObject({ nombre: 'Vajilla', padre: 'Cocina', activo: true });
    });

    it('filtra por texto, por categorías raíz y por padre', async () => {
      expect((await listar('?q=vaj')).body.datos.map((c: { nombre: string }) => c.nombre)).toEqual(['Vajilla']);
      expect((await listar('?raiz=true')).body.total).toBe(2);
      const cocina = (await listar('?q=Cocina')).body.datos[0];
      expect((await listar(`?padreId=${cocina.id}`)).body.datos.map((c: { nombre: string }) => c.nombre)).toEqual(['Vajilla']);
    });

    it('rechaza ordenar por una columna fuera de la lista blanca', async () => {
      const { body } = await request(contexto.app).get(`${RUTA}?orden=descripcion`).set('Cookie', cookie).expect(400);
      expect(body.campos).toEqual({ orden: 'VALOR_NO_PERMITIDO' });
    });
  });

  describe('Acceso', () => {
    it('responde 401 SESION_INVALIDA sin sesión', async () => {
      const { body } = await request(contexto.app).get(RUTA).expect(401);
      expect(body.code).toBe('SESION_INVALIDA');
    });

    it('responde 403 SIN_PERMISO sin el permiso parametros:editar', async () => {
      await crearUsuario(contexto.orm, { nombreUsuario: 'vendedor', permisos: ['ventas:registrar'] });
      const otra = await iniciarSesion(contexto.app, 'vendedor');
      const { body } = await request(contexto.app).get(RUTA).set('Cookie', otra).expect(403);
      expect(body.code).toBe('SIN_PERMISO');
    });
  });
});
