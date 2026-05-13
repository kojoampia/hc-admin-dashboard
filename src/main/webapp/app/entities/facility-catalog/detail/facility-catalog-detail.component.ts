import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IFacilityCatalog } from '../facility-catalog.model';

@Component({
  selector: 'hpd-facility-catalog-detail',
  templateUrl: './facility-catalog-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class FacilityCatalogDetailComponent {
  facilityCatalog = input<IFacilityCatalog | null>(null);

  previousState(): void {
    window.history.back();
  }
}
