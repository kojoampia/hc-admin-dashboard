import { APP_INITIALIZER, EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { translatePartialLoader, missingTranslationHandler } from 'app/config/translation.config';
import { StateStorageService } from 'app/core/auth/state-storage.service';

function initializeTranslation(translateService: TranslateService, stateStorageService: StateStorageService): () => void {
  return () => {
    translateService.setDefaultLang('en');
    // if user have changed language and navigates away from the application and back to the application then use previously choosed language
    const langKey = stateStorageService.getLocale() ?? 'en';
    translateService.use(langKey);
  };
}

export function provideTranslation(): EnvironmentProviders {
  return makeEnvironmentProviders([
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: translatePartialLoader,
          deps: [HttpClient],
        },
        missingTranslationHandler: {
          provide: MissingTranslationHandler,
          useFactory: missingTranslationHandler,
        },
      }),
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTranslation,
      deps: [TranslateService, StateStorageService],
      multi: true,
    },
  ]);
}
