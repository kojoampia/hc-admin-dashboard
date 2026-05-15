import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { IDutyRoster } from '../duty-roster.model';

@Component({
  selector: 'hpd-duty-roster-detail',
  templateUrl: './duty-roster-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe],
})
export class DutyRosterDetailComponent {
  dutyRoster = input<IDutyRoster | null>(null);

  previousState(): void {
    window.history.back();
  }
}
