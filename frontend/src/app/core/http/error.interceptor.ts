import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '@core/auth/auth.store';
import { ApiError } from './api-error';

/**
 * Convierte toda respuesta fallida en `ApiError` y resuelve los casos transversales (arquitectura-frontend.md,
 * secciones 5.6 y 5.7):
 * - 401 `SESION_INVALIDA` con una sesión cargada (sesión vencida durante el uso): limpia la sesión y lleva al login
 *   conservando la ruta.
 * - 403: lleva a `/sin-permiso`.
 * El resto de los errores sigue hacia quien hizo la solicitud, que los muestra en su panel o debajo del campo.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthStore);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) return throwError(() => error);
      const apiError = ApiError.desde(error);

      if (apiError.code === 'SESION_INVALIDA' && auth.autenticado()) {
        auth.limpiar();
        void router.navigate(['/login'], { queryParams: { volver: router.url } });
      } else if (apiError.status === 403) {
        void router.navigate(['/sin-permiso']);
      }
      return throwError(() => apiError);
    }),
  );
};
