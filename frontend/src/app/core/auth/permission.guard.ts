import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { Permiso } from './permisos';

/** Exige un permiso para entrar a la ruta. Sin el permiso, lleva a `/sin-permiso`. */
export function permissionGuard(permiso: Permiso): CanActivateFn {
  return () => inject(AuthStore).puede(permiso) || inject(Router).createUrlTree(['/sin-permiso']);
}
