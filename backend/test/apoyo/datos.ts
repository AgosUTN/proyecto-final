import type { Express } from 'express';
import type { MikroORM } from '@mikro-orm/mysql';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { expect } from 'vitest';
import { Rol } from '../../src/modules/roles/rol.entity';
import { Usuario } from '../../src/modules/usuarios/usuario.entity';
import type { Permiso } from '../../src/shared/auth/permisos';

export const CONTRASENA_DE_PRUEBA = 'Prueba.2026';

export interface UsuarioDePrueba {
  nombreUsuario?: string;
  /** `null` crea un usuario sin contraseña. */
  contrasena?: string | null;
  activo?: boolean;
  permisos?: Permiso[];
}

/** Crea un rol con los permisos indicados y un usuario con ese rol. */
export async function crearUsuario(orm: MikroORM, datos: UsuarioDePrueba = {}): Promise<Usuario> {
  const em = orm.em.fork();
  const nombreUsuario = datos.nombreUsuario ?? 'prueba';
  const rol = em.create(Rol, {
    nombre: `Rol de ${nombreUsuario}`,
    descripcion: 'Rol creado para los tests.',
    permisos: datos.permisos ?? [],
  });
  const contrasena = datos.contrasena === undefined ? CONTRASENA_DE_PRUEBA : datos.contrasena;
  const usuario = em.create(Usuario, {
    nombreUsuario,
    email: `${nombreUsuario}@prueba.test`,
    hashContrasena: contrasena === null ? null : bcrypt.hashSync(contrasena, 4),
    activo: datos.activo ?? true,
    rol,
  });
  await em.flush();
  return usuario;
}

/** Inicia sesión y devuelve la cookie para usar en las siguientes requests. */
export async function iniciarSesion(app: Express, nombreUsuario = 'prueba', contrasena = CONTRASENA_DE_PRUEBA) {
  const respuesta = await request(app).post('/api/auth/login').send({ nombreUsuario, contrasena });
  expect(respuesta.status).toBe(200);
  return respuesta.headers['set-cookie'] as unknown as string[];
}

/** Crea un usuario con los permisos indicados y devuelve su cookie de sesión. */
export async function sesionCon(orm: MikroORM, app: Express, permisos: Permiso[]) {
  await crearUsuario(orm, { permisos });
  return iniciarSesion(app);
}
