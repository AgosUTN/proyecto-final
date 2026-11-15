import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiError } from './api-error';

/**
 * Convierte toda respuesta fallida en `ApiError` y resuelve los casos transversales (arquitectura-frontend.md,
 * sección 5.7): un 403 lleva a `/sin-permiso`. El resto de los errores sigue hacia quien hizo la solicitud, que los
 * muestra en su panel o debajo del campo.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) return throwError(() => error);
      const apiError = ApiError.desde(error);
      if (apiError.status === 403) void router.navigate(['/sin-permiso']);
      return throwError(() => apiError);
    }),
  );
};
