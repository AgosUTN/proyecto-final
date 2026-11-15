import { HttpInterceptorFn } from '@angular/common/http';

/** Envía la cookie de sesión (httpOnly) en cada solicitud (arquitectura-frontend.md, sección 5.7). */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ withCredentials: true }));
