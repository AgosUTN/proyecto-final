import { permisosDeRol } from '../../shared/auth/permisos';
import type { Usuario } from '../usuarios/usuario.entity';
import type { UsuarioSesionDto } from './auth.dto';

export const AuthMapper = {
  sesion: (usuario: Usuario): UsuarioSesionDto => ({
    id: usuario.id,
    nombre: usuario.nombreUsuario,
    rol: usuario.rol.nombre,
    permisos: permisosDeRol(usuario.rol),
  }),
};
