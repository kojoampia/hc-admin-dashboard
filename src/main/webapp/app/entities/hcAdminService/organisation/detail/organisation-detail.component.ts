import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { IOrganisation } from '../organisation.model';

@Component({
  selector: 'hpd-organisation-detail',
  templateUrl: './organisation-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe],
})
export class OrganisationDetailComponent {
  organisation = input<IOrganisation | null>(null);

  previousState(): void {
    window.history.back();
  }
}
