import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { IFacility } from '../facility.model';

@Component({
  selector: 'hpd-facility-detail',
  templateUrl: './facility-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class FacilityDetailComponent {
  facility = input<IFacility | null>(null);

  previousState(): void {
    window.history.back();
  }
}
