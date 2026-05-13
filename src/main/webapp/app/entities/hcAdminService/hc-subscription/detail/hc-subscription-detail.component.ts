import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { IHCSubscription } from '../hc-subscription.model';

@Component({
  selector: 'hpd-hc-subscription-detail',
  templateUrl: './hc-subscription-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class HCSubscriptionDetailComponent {
  hCSubscription = input<IHCSubscription | null>(null);

  previousState(): void {
    window.history.back();
  }
}
