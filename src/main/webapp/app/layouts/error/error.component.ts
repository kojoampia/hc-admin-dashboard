import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import SharedModule from 'app/shared/shared.module';

@Component({
  selector: 'hpd-error',
  templateUrl: './error.component.html',
  imports: [SharedModule, MatCardModule],
})
export default class ErrorComponent implements OnInit, OnDestroy {
  private translateService = inject(TranslateService);
  private route = inject(ActivatedRoute);

  errorMessage?: string;
  errorKey?: string;
  langChangeSubscription?: Subscription;

  ngOnInit(): void {
    this.route.data.subscribe(routeData => {
      if (routeData.errorMessage) {
        this.errorKey = routeData.errorMessage;
        this.getErrorMessageTranslation();
        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => this.getErrorMessageTranslation());
      }
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  private getErrorMessageTranslation(): void {
    this.errorMessage = '';
    if (this.errorKey) {
      this.translateService.get(this.errorKey).subscribe(translatedErrorMessage => {
        this.errorMessage = translatedErrorMessage;
      });
    }
  }
}
