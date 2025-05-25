import { ApplicationConfig, importProvidersFrom, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideHttpClient,
  withInterceptors,
  HttpClientModule,
} from '@angular/common/http';
import { LoaderInterceptor } from './interceptors/loader.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),
    provideHttpClient(
      withInterceptors([LoaderInterceptor]) // pass the function directly, no new
    ),
  ],
};
