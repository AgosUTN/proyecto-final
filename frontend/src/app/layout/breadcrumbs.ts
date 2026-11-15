import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbService } from '@core/navigation/breadcrumbs';

/**
 * Migas de pan de la barra superior. En pantallas angostas muestra solo las dos últimas.
 */
@Component({
  selector: 'app-breadcrumbs',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    ol {
      display: flex;
      align-items: center;
      gap: var(--esp-2);
      min-width: 0;
      margin: 0;
      padding: 0;
      list-style: none;
      font: var(--t-peq);
      color: var(--carbon-600);
    }
    li {
      display: flex;
      align-items: center;
      gap: var(--esp-2);
      min-width: 0;
      white-space: nowrap;
    }
    li + li::before {
      content: '/';
      color: var(--borde-control);
    }
    a {
      color: var(--carbon-600);
      text-decoration: none;
      border-radius: var(--r-xs);
    }
    a:hover {
      color: var(--carbon-900);
      text-decoration: underline;
    }
    [aria-current] {
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
      color: var(--carbon-900);
    }
    @media (max-width: 639px) {
      li:not(:nth-last-child(-n + 2)) {
        display: none;
      }
    }
  `,
  template: `
    @if (servicio.items().length) {
      <nav aria-label="Ruta de navegación">
        <ol>
          @for (item of servicio.items(); track $index; let ultimo = $last) {
            <li>
              @if (item.url) {
                <a [routerLink]="item.url">{{ item.label }}</a>
              } @else {
                <span [attr.aria-current]="ultimo ? 'page' : null">{{ item.label }}</span>
              }
            </li>
          }
        </ol>
      </nav>
    }
  `,
})
export class Breadcrumbs {
  protected readonly servicio = inject(BreadcrumbService);
}
