import { PERMISOS } from '../../shared/auth/permisos';
import { em } from '../../shared/db/orm';
import { Rol } from './rol.entity';

/**
 * Operaciones sobre roles que necesitan otros módulos (usuarios). El CRUD de roles, con sus reglas de baja (modelo de
 * dominio, ROL), está pendiente.
 */
export const rolesService = {
  /**
   * Rol «Administrador» con todos los permisos del catálogo, para el administrador inicial (convenciones, sección
   * 7.5). Queda registrado en el EntityManager en uso; lo guarda el flush de la transacción que lo llama.
   */
  crearAdministrador(): Rol {
    return em().create(Rol, {
      nombre: 'Administrador',
      descripcion: 'Rol inicial con todos los permisos del sistema.',
      permisos: [...PERMISOS],
    });
  },
};
