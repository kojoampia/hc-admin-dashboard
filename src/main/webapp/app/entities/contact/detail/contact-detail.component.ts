import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IContact } from '../contact.model';

@Component({
  selector: 'hpd-contact-detail',
  templateUrl: './contact-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class ContactDetailComponent {
  contact = input<IContact | null>(null);

  previousState(): void {
    window.history.back();
  }
}
