import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('recepciones:registrar')],
    title: 'Recepciones',
    data: {
      breadcrumb: 'Recepciones',
      titulo: 'Recepciones',
      descripcion: 'Recepción de mercadería con control contra la orden de compra.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
