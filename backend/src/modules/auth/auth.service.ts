import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import { COSTO_BCRYPT, firmarSesion } from '../../shared/auth/sesion';
import { ApiError } from '../../shared/http/api-error';
import type { Usuario } from '../usuarios/usuario.entity';
import { usuariosService } from '../usuarios/usuarios.service';
import { ERRORES } from './auth.errors';
import type { LoginDto } from './auth.schemas';

/**
 * Hash de referencia para comparar cuando el usuario no existe, está inactivo o no tiene contraseña: así la respuesta
 * tarda lo mismo en todos los casos y no revela qué dato falló.
 */
const HASH_DE_REFERENCIA = bcrypt.hashSync(randomUUID(), COSTO_BCRYPT);

export const authService = {
  async iniciarSesion(dto: LoginDto): Promise<{ usuario: Usuario; token: string }> {
    const usuario = await usuariosService.buscarParaInicioDeSesion(dto.nombreUsuario);
    const hash = usuario?.activo ? usuario.hashContrasena : null;
    const coincide = await bcrypt.compare(dto.contrasena, hash ?? HASH_DE_REFERENCIA);
    if (!usuario || !hash || !coincide) throw new ApiError(ERRORES.CREDENCIALES_INVALIDAS);

    await usuariosService.registrarAcceso(usuario); // RNS-USU-01
    return { usuario, token: firmarSesion(usuario.id) };
  },
};
