import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { Usuario } from '../src/modules/usuarios/usuario.entity';
import { usarContextoDePrueba } from './apoyo/contexto';
import { CONTRASENA_DE_PRUEBA, crearUsuario, iniciarSesion } from './apoyo/datos';

const CREDENCIALES_INVALIDAS = {
  status: 401,
  code: 'CREDENCIALES_INVALIDAS',
  mensaje: 'El nombre de usuario o la contraseña no son válidos.',
};

describe('POST /api/auth/login', () => {
  const contexto = usarContextoDePrueba();

  it('inicia la sesión con una cookie httpOnly y devuelve el usuario con sus permisos', async () => {
    const usuario = await crearUsuario(contexto.orm, { permisos: ['parametros:editar', 'stock:leer'] });
    const respuesta = await request(contexto.app)
      .post('/api/auth/login')
      .send({ nombreUsuario: 'prueba', contrasena: CONTRASENA_DE_PRUEBA })
      .expect(200);

    expect(respuesta.body).toEqual({
      datos: { id: usuario.id, nombre: 'prueba', rol: 'Rol de prueba', permisos: ['stock:leer', 'parametros:editar'] },
    });
    const cookie = (respuesta.headers['set-cookie'] as unknown as string[])[0];
    expect(cookie).toMatch(/^access_token=/);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Strict');
    expect(cookie).toContain('Max-Age=10800');
  });

  it('RNS-USU-01: el inicio de sesión actualiza el último acceso', async () => {
    const usuario = await crearUsuario(contexto.orm);
    expect(usuario.ultimoAcceso ?? null).toBeNull();
    await iniciarSesion(contexto.app);
    const actualizado = await contexto.orm.em.fork().findOneOrFail(Usuario, usuario.id);
    expect(actualizado.ultimoAcceso).toBeInstanceOf(Date);
  });

  it.each([
    ['un usuario inexistente', {}, 'otro', CONTRASENA_DE_PRUEBA],
    ['una contraseña incorrecta', {}, 'prueba', 'Incorrecta.1'],
    ['un usuario inactivo', { activo: false }, 'prueba', CONTRASENA_DE_PRUEBA],
    ['un usuario sin contraseña', { contrasena: null }, 'prueba', CONTRASENA_DE_PRUEBA],
  ])('rechaza %s con la misma respuesta', async (_caso, datos, nombreUsuario, contrasena) => {
    await crearUsuario(contexto.orm, datos);
    const respuesta = await request(contexto.app).post('/api/auth/login').send({ nombreUsuario, contrasena }).expect(401);
    expect(respuesta.body).toEqual(CREDENCIALES_INVALIDAS);
    expect(respuesta.headers['set-cookie']).toBeUndefined();
  });

  it('valida el body', async () => {
    const { body } = await request(contexto.app).post('/api/auth/login').send({ nombreUsuario: 'prueba' }).expect(400);
    expect(body).toMatchObject({ code: 'VALIDACION', campos: { contrasena: 'REQUERIDO' } });
  });
});

describe('GET /api/auth/me', () => {
  const contexto = usarContextoDePrueba();

  it('devuelve el usuario de la sesión', async () => {
    const usuario = await crearUsuario(contexto.orm, { permisos: ['panel:leer'] });
    const cookie = await iniciarSesion(contexto.app);
    const { body } = await request(contexto.app).get('/api/auth/me').set('Cookie', cookie).expect(200);
    expect(body).toEqual({ datos: { id: usuario.id, nombre: 'prueba', rol: 'Rol de prueba', permisos: ['panel:leer'] } });
  });

  it('responde 401 SESION_INVALIDA sin cookie', async () => {
    const { body } = await request(contexto.app).get('/api/auth/me').expect(401);
    expect(body.code).toBe('SESION_INVALIDA');
  });

  it('responde 401 con un token firmado con otro secreto', async () => {
    const usuario = await crearUsuario(contexto.orm);
    const token = jwt.sign({}, 'otro-secreto-de-al-menos-32-caracteres', { subject: String(usuario.id) });
    const { body } = await request(contexto.app).get('/api/auth/me').set('Cookie', `access_token=${token}`).expect(401);
    expect(body.code).toBe('SESION_INVALIDA');
  });

  it('responde 401 si el usuario se desactivó después de iniciar sesión', async () => {
    const usuario = await crearUsuario(contexto.orm);
    const cookie = await iniciarSesion(contexto.app);
    await contexto.orm.em.fork().nativeUpdate(Usuario, { id: usuario.id }, { activo: false });
    const { body } = await request(contexto.app).get('/api/auth/me').set('Cookie', cookie).expect(401);
    expect(body.code).toBe('SESION_INVALIDA');
  });
});

describe('POST /api/auth/logout', () => {
  const contexto = usarContextoDePrueba();

  it('responde 204 y borra la cookie', async () => {
    const respuesta = await request(contexto.app).post('/api/auth/logout').expect(204);
    expect(respuesta.text).toBe('');
    expect((respuesta.headers['set-cookie'] as unknown as string[])[0]).toMatch(
      /^access_token=;.*Expires=Thu, 01 Jan 1970/,
    );
  });
});
