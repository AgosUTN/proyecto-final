import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { Rol } from '../src/modules/roles/rol.entity';
import { Usuario } from '../src/modules/usuarios/usuario.entity';
import { usuariosService, type DatosAdministradorInicial } from '../src/modules/usuarios/usuarios.service';
import { PERMISOS } from '../src/shared/auth/permisos';
import { usarContextoDePrueba } from './apoyo/contexto';
import { crearUsuario, iniciarSesion } from './apoyo/datos';

describe('Administrador inicial', () => {
  const contexto = usarContextoDePrueba();
  const datos = { nombreUsuario: 'admin', email: 'admin@prueba.test', contrasena: 'Inicial.2026' };
  const asegurar = (valor: DatosAdministradorInicial | null) =>
    contexto.enContexto(() => usuariosService.asegurarAdministradorInicial(valor));

  it('crea el rol Administrador con todos los permisos y un usuario que puede iniciar sesión', async () => {
    expect(await asegurar(datos)).toBe('creado');
    const cookie = await iniciarSesion(contexto.app, 'admin', 'Inicial.2026');
    const { body } = await request(contexto.app).get('/api/auth/me').set('Cookie', cookie).expect(200);
    expect(body.datos).toMatchObject({ nombre: 'admin', rol: 'Administrador', permisos: [...PERMISOS] });
  });

  it('no modifica nada si ya existen usuarios', async () => {
    await crearUsuario(contexto.orm);
    expect(await asegurar(datos)).toBe('existente');
    expect(await contexto.orm.em.fork().count(Usuario, {})).toBe(1);
  });

  it('informa que faltan los datos si la base no tiene usuarios', async () => {
    expect(await asegurar(null)).toBe('sin-datos');
  });
});

describe('Rol inactivo', () => {
  const contexto = usarContextoDePrueba();

  it('mantiene la sesión pero no otorga permisos', async () => {
    const usuario = await crearUsuario(contexto.orm, { permisos: ['parametros:editar'] });
    const cookie = await iniciarSesion(contexto.app);
    await contexto.orm.em.fork().nativeUpdate(Rol, { id: usuario.rol.id }, { activo: false });

    const { body } = await request(contexto.app).get('/api/auth/me').set('Cookie', cookie).expect(200);
    expect(body.datos.permisos).toEqual([]);
    await request(contexto.app).get('/api/categorias').set('Cookie', cookie).expect(403);
  });
});
