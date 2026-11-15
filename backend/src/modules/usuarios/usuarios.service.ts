import bcrypt from 'bcrypt';
import { COSTO_BCRYPT } from '../../shared/auth/sesion';
import { em } from '../../shared/db/orm';
import { rolesService } from '../roles/roles.service';
import { Usuario } from './usuario.entity';

export interface DatosAdministradorInicial {
  nombreUsuario: string;
  email: string;
  contrasena: string;
}

export type ResultadoAdministradorInicial = 'creado' | 'existente' | 'sin-datos';

/**
 * Operaciones sobre usuarios que necesitan otros módulos (auth) y el arranque. El CRUD de usuarios, con sus
 * esquemas, DTOs y rutas, está pendiente.
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

  /**
   * Administrador inicial (convenciones, sección 7.5): si la tabla de usuarios está vacía, crea el rol
   * «Administrador» con todos los permisos y el usuario indicado. Si ya hay usuarios, no modifica nada.
   */
  async asegurarAdministradorInicial(datos: DatosAdministradorInicial | null): Promise<ResultadoAdministradorInicial> {
    if ((await em().count(Usuario, {})) > 0) return 'existente';
    if (!datos) return 'sin-datos';

    const hashContrasena = await bcrypt.hash(datos.contrasena, COSTO_BCRYPT);
    await em().transactional(async () => {
      const rol = rolesService.crearAdministrador();
      em().create(Usuario, { nombreUsuario: datos.nombreUsuario, email: datos.email, hashContrasena, rol });
    });
    return 'creado';
  },
};
