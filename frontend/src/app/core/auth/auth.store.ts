import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthApi, LoginDto, UsuarioSesion } from './auth.api';
import { Permiso } from './permisos';

/**
 * Sesión del usuario (arquitectura-frontend.md, sección 5.6). Se carga desde `/api/auth/me` al iniciar la aplicación;
 * los guards, el menú y la directiva `*can` la leen. Nunca se usa `localStorage`.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(AuthApi);

  private readonly _usuario = signal<UsuarioSesion | null>(null);
  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._usuario() !== null);
  /** Permisos del rol del usuario, tal como llegan de `/api/auth/me`. */
  readonly permisos = computed(() => new Set<Permiso>(this._usuario()?.permisos ?? []));

  puede(permiso: Permiso): boolean {
    return this.permisos().has(permiso);
  }

  /** Carga la sesión vigente. Sin sesión válida, el usuario queda como anónimo. */
  async cargarSesion(): Promise<void> {
    try {
      this._usuario.set(await firstValueFrom(this.api.sesionActual()));
    } catch {
      this._usuario.set(null);
    }
  }

  /** Inicia la sesión. Si las credenciales no son válidas, rechaza con el `ApiError` del backend. */
  async iniciarSesion(dto: LoginDto): Promise<void> {
    this._usuario.set(await firstValueFrom(this.api.iniciarSesion(dto)));
  }

  async cerrarSesion(): Promise<void> {
    try {
      await firstValueFrom(this.api.cerrarSesion());
    } finally {
      this._usuario.set(null);
    }
  }

  /** Olvida la sesión sin llamar al backend (por ejemplo, ante un 401 por sesión vencida). */
  limpiar(): void {
    this._usuario.set(null);
  }
}
