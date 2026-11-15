import 'reflect-metadata';
import { MikroORM, RequestContext } from '@mikro-orm/mysql';
import { crearApp } from './app';
import { env } from './config/env';
import { ENTIDADES } from './modules';
import { usuariosService } from './modules/usuarios/usuarios.service';
import { configuracionOrm } from './shared/db/mikro-orm.config';
import { logger } from './shared/logger';

/** Crea el administrador inicial si la base no tiene usuarios (convenciones, sección 7.5). */
async function asegurarAdministradorInicial(orm: MikroORM): Promise<void> {
  const { ADMIN_USUARIO, ADMIN_EMAIL, ADMIN_CONTRASENA } = env;
  const datos =
    ADMIN_USUARIO && ADMIN_EMAIL && ADMIN_CONTRASENA
      ? { nombreUsuario: ADMIN_USUARIO, email: ADMIN_EMAIL, contrasena: ADMIN_CONTRASENA }
      : null;

  const resultado = await RequestContext.create(orm.em, () => usuariosService.asegurarAdministradorInicial(datos));
  if (resultado === 'creado') {
    logger.info(`Se creó el administrador inicial «${ADMIN_USUARIO}» con el rol «Administrador».`);
  } else if (resultado === 'sin-datos') {
    logger.warn(
      'La base no tiene usuarios y faltan ADMIN_USUARIO, ADMIN_EMAIL o ADMIN_CONTRASENA: no se creó el administrador inicial.',
    );
  }
}

async function main() {
  const orm = await MikroORM.init(configuracionOrm(ENTIDADES));

  // Crea o actualiza las tablas según las entidades, sin borrar tablas ni columnas (convenciones, sección 7.5).
  await orm.schema.update({ safe: true });
  await asegurarAdministradorInicial(orm);

  crearApp(orm).listen(env.PORT, () => {
    logger.info(`API de negocio escuchando en el puerto ${env.PORT}`);
  });
}

main().catch((error: unknown) => {
  logger.fatal({ err: error }, 'No se pudo iniciar la API de negocio');
  process.exit(1);
});
