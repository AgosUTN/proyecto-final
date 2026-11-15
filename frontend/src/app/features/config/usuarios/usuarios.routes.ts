import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('usuarios:administrar') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
    title: 'Usuarios y roles',
    data: {
      breadcrumb: 'Usuarios y roles',
      titulo: 'Usuarios y roles',
      descripcion: 'Usuarios del sistema y rol asignado a cada uno.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
