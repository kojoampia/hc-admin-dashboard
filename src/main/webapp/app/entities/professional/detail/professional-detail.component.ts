import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { IProfessional } from '../professional.model';

@Component({
  selector: 'hpd-professional-detail',
  templateUrl: './professional-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe],
})
export class ProfessionalDetailComponent {
  professional = input<IProfessional | null>(null);

  previousState(): void {
    window.history.back();
  }
}
