import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { IHProfessional } from '../h-professional.model';

@Component({
  selector: 'hpd-h-professional-detail',
  templateUrl: './h-professional-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe],
})
export class HProfessionalDetailComponent {
  hProfessional = input<IHProfessional | null>(null);

  previousState(): void {
    window.history.back();
  }
}
