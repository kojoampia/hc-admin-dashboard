import { ApplicationConfig, LOCALE_ID, importProvidersFrom, inject, APP_INITIALIZER } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterFeatures, TitleStrategy, provideRouter, withComponentInputBinding, withDebugTracing } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';
import { provideNgxWebstorage, withLocalStorage, withSessionStorage } from 'ngx-webstorage';

import { DEBUG_INFO_ENABLED } from 'app/app.constants';
import './config/dayjs';
import { provideTranslation } from 'app/shared/language/translation.module';
import { httpInterceptorProviders } from 'app/core/interceptor/index';
import routes from './app.routes';
// jhipster-needle-angular-add-module-import JHipster will add new module here
import { AppPageTitleStrategy } from './app-page-title-strategy';

const routerFeatures: Array<RouterFeatures> = [withComponentInputBinding()];
if (DEBUG_INFO_ENABLED) {
  routerFeatures.push(withDebugTracing());
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, ...routerFeatures),
    importProvidersFrom(BrowserModule),
    importProvidersFrom(BrowserAnimationsModule),
    // Set this to true to enable service worker (PWA)
    importProvidersFrom(ServiceWorkerModule.register('ngsw-worker.js', { enabled: false })),
    provideTranslation(),
    provideHttpClient(withInterceptorsFromDi()),
    Title,
    { provide: LOCALE_ID, useValue: 'en' },
    httpInterceptorProviders,
    provideNgxWebstorage(withLocalStorage(), withSessionStorage()),
    { provide: TitleStrategy, useClass: AppPageTitleStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory() {
        const iconRegistry = inject(MatIconRegistry);
        return () => iconRegistry.setDefaultFontSetClass('material-icons');
      },
      multi: true,
    },
    // jhipster-needle-angular-add-module JHipster will add new module here
  ],
};
