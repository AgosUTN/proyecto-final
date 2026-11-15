import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('descuentos:editar')],
    title: 'Descuentos',
    data: {
      breadcrumb: 'Descuentos',
      titulo: 'Descuentos',
      descripcion: 'Promociones y descuentos, con su vigencia y alcance.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
