import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('analisis:leer')],
    title: 'Stock sin rotación',
    data: {
      breadcrumb: 'Stock sin rotación',
      titulo: 'Stock sin rotación',
      descripcion: 'Detección de productos sin rotación y promociones de liquidación.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
