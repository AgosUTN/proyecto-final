import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { AuthStore } from './auth.store';
import { Permiso } from './permisos';

/**
 * Muestra el contenido solo si el usuario tiene el permiso. Ocultar una acción no reemplaza la validación: el backend
 * controla cada permiso.
 *
 * <button *can="'stock:ajustar'" appBoton="primario" type="button">Registrar ajuste</button>
 */
@Directive({ selector: '[can]' })
export class Can {
  readonly permiso = input.required<Permiso>({ alias: 'can' });

  private readonly auth = inject(AuthStore);
  private readonly contenedor = inject(ViewContainerRef);
  private readonly template = inject(TemplateRef);
  private visible = false;

  constructor() {
    effect(() => {
      const puede = this.auth.puede(this.permiso());
      if (puede && !this.visible) this.contenedor.createEmbeddedView(this.template);
      if (!puede && this.visible) this.contenedor.clear();
      this.visible = puede;
    });
  }
}
