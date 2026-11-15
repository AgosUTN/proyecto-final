import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { components } from '@core/http/generated/api';

export type UsuarioSesion = components['schemas']['UsuarioSesion'];
export type LoginDto = components['schemas']['Login'];

/** Llamadas HTTP de la sesión (convenciones de la API, sección 6.2). */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);

  iniciarSesion(dto: LoginDto): Observable<UsuarioSesion> {
    return this.http.post<{ datos: UsuarioSesion }>('auth/login', dto).pipe(map((r) => r.datos));
  }

  cerrarSesion(): Observable<void> {
    return this.http.post<void>('auth/logout', null);
  }

  sesionActual(): Observable<UsuarioSesion> {
    return this.http.get<{ datos: UsuarioSesion }>('auth/me').pipe(map((r) => r.datos));
  }
}
