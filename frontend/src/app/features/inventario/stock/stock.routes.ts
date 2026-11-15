import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('stock:leer')],
    title: 'Stock y variantes',
    data: {
      breadcrumb: 'Stock y variantes',
      titulo: 'Stock y variantes',
      descripcion: 'Stock disponible por variante, movimientos y ajustes manuales.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
