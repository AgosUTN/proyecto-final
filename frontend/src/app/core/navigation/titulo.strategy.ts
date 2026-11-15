import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

export const NOMBRE_APP = 'Champagne Florentina';

/** Título de pestaña: "Productos | Champagne Florentina", a partir de `title` de cada ruta. */
@Injectable()
export class TituloStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(estado: RouterStateSnapshot): void {
    const titulo = this.buildTitle(estado);
    this.title.setTitle(titulo ? `${titulo} | ${NOMBRE_APP}` : NOMBRE_APP);
  }
}
