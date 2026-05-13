import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { IAddress } from '../address.model';

@Component({
  selector: 'hpd-address-detail',
  templateUrl: './address-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class AddressDetailComponent {
  address = input<IAddress | null>(null);

  previousState(): void {
    window.history.back();
  }
}
