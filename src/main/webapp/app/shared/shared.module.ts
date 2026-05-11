import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import FindLanguageFromKeyPipe from './language/find-language-from-key.pipe';
import TranslateDirective from './language/translate.directive';
import { AlertComponent } from './alert/alert.component';
import { AlertErrorComponent } from './alert/alert-error.component';

export { AlertComponent, AlertErrorComponent, FindLanguageFromKeyPipe, TranslateDirective };

const SharedModule = [
  CommonModule,
  NgbModule,
  FontAwesomeModule,
  AlertComponent,
  AlertErrorComponent,
  TranslateModule,
  FindLanguageFromKeyPipe,
  TranslateDirective,
];

export default SharedModule;
