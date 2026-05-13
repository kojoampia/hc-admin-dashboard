import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { IHCService } from '../hc-service.model';

@Component({
  selector: 'hpd-hc-service-detail',
  templateUrl: './hc-service-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe],
})
export class HCServiceDetailComponent {
  hCService = input<IHCService | null>(null);

  previousState(): void {
    window.history.back();
  }
}
