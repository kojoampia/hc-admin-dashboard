import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { IOrganisation } from '../organisation.model';

@Component({
  selector: 'hpd-organisation-detail',
  templateUrl: './organisation-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class OrganisationDetailComponent {
  organisation = input<IOrganisation | null>(null);

  previousState(): void {
    window.history.back();
  }
}
