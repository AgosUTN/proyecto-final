import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { TitleStrategy, provideRouter, withComponentInputBinding } from '@angular/router';
import { FEATURES } from '@core/navigation/feature.types';
import { TituloStrategy } from '@core/navigation/titulo.strategy';
import { FEATURES_APP } from './app.features';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    { provide: TitleStrategy, useClass: TituloStrategy },
    { provide: FEATURES, useValue: FEATURES_APP },
  ],
};
