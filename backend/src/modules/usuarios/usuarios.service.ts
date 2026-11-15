import { em } from '../../shared/db/orm';
import { Usuario } from './usuario.entity';

/**
 * Operaciones sobre usuarios que necesitan otros módulos (auth). El CRUD de usuarios, con sus esquemas, DTOs y
 * rutas, está pendiente.
 */
export const usuariosService = {
  /** Usuario con su rol y el hash de la contraseña, para verificar el inicio de sesión. */
  buscarParaInicioDeSesion(nombreUsuario: string) {
    return em().findOne(Usuario, { nombreUsuario }, { populate: ['rol', 'hashContrasena'] });
  },

  /** Usuario activo con su rol, para la sesión en curso. `null` si no existe o está inactivo. */
  obtenerSesion(id: number) {
    return em().findOne(Usuario, { id, activo: true }, { populate: ['rol'] });
  },

  /** RNS-USU-01: el inicio de sesión actualiza el último acceso. */
  async registrarAcceso(usuario: Usuario): Promise<void> {
    usuario.ultimoAcceso = new Date();
    await em().flush();
  },
};
