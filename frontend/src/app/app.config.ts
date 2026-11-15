import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeEsAr from '@angular/common/locales/es-AR';
import {
  ApplicationConfig,
  LOCALE_ID,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { TitleStrategy, provideRouter, withComponentInputBinding } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { apiBaseInterceptor } from '@core/http/api-base.interceptor';
import { credentialsInterceptor } from '@core/http/credentials.interceptor';
import { errorInterceptor } from '@core/http/error.interceptor';
import { FEATURES } from '@core/navigation/feature.types';
import { TituloStrategy } from '@core/navigation/titulo.strategy';
import { FEATURES_APP } from './app.features';
import { routes } from './app.routes';

registerLocaleData(localeEsAr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    // Orden de la sección 5.7 de la arquitectura
    provideHttpClient(withInterceptors([apiBaseInterceptor, credentialsInterceptor, errorInterceptor])),
    // La sesión se carga antes de la primera navegación: los guards y el menú ya la encuentran (sección 5.6)
    provideAppInitializer(() => inject(AuthStore).cargarSesion()),
    { provide: LOCALE_ID, useValue: 'es-AR' },
    { provide: TitleStrategy, useClass: TituloStrategy },
    { provide: FEATURES, useValue: FEATURES_APP },
  ],
};
