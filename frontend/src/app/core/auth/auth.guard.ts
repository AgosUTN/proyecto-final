import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

/** Exige sesión. Sin sesión, lleva al login conservando la ruta pedida en `volver`. */
export const authGuard: CanActivateFn = (_ruta, estado) =>
  inject(AuthStore).autenticado() ||
  inject(Router).createUrlTree(['/login'], { queryParams: { volver: estado.url } });

/** Solo para quien no inició sesión (pantalla de login). Con sesión, lleva al panel. */
export const invitadoGuard: CanActivateFn = () =>
  !inject(AuthStore).autenticado() || inject(Router).createUrlTree(['/panel']);
