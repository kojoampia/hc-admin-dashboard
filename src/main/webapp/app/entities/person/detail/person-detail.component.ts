import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { IPerson } from '../person.model';

@Component({
  selector: 'hpd-person-detail',
  templateUrl: './person-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class PersonDetailComponent {
  person = input<IPerson | null>(null);

  previousState(): void {
    window.history.back();
  }
}
