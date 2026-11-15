import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { ApiError } from '@core/http/api-error';
import { textoDeError, textoDeValidacion } from '@core/http/error-catalog';
import { NOMBRE_APP } from '@core/navigation/titulo.strategy';
import { Alerta, Boton, Campo, InputCampo, Panel } from '@shared/ui';

type CampoLogin = 'nombreUsuario' | 'contrasena';

/**
 * Inicio de sesión del personal (arquitectura-frontend.md, sección 5.6). Sin mockup propio: un panel centrado con los
 * componentes del sistema de diseño. Al ingresar, vuelve a la ruta pedida (`volver`) o al panel.
 */
@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, Panel, Campo, InputCampo, Boton, Alerta],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export default class LoginPage {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  /** Ruta a la que se vuelve después de iniciar sesión (query param `volver`). */
  readonly volver = input<string>();

  protected readonly nombreApp = NOMBRE_APP;
  protected readonly form = inject(NonNullableFormBuilder).group({
    nombreUsuario: ['', [Validators.required, Validators.maxLength(50)]],
    contrasena: ['', [Validators.required, Validators.maxLength(72)]],
  });
  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly error = signal<string | null>(null);

  protected errorDe(campo: CampoLogin): string | null {
    const control = this.form.controls[campo];
    return control.touched || this.enviado() ? textoDeValidacion(control.errors) : null;
  }

  protected async ingresar(): Promise<void> {
    this.enviado.set(true);
    if (this.form.invalid || this.enviando()) return;

    this.enviando.set(true);
    this.error.set(null);
    try {
      await this.auth.iniciarSesion(this.form.getRawValue());
      await this.router.navigateByUrl(this.destino());
    } catch (error) {
      this.error.set(textoDeError(error instanceof ApiError ? error.code : ''));
    } finally {
      this.enviando.set(false);
    }
  }

  /** Solo rutas internas: evita redirigir a otro sitio con un `volver` manipulado. */
  private destino(): string {
    const volver = this.volver();
    return volver?.startsWith('/') && !volver.startsWith('//') ? volver : '/panel';
  }
}
