import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { IProfile } from '../profile.model';

@Component({
  selector: 'hpd-profile-detail',
  templateUrl: './profile-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class ProfileDetailComponent {
  profile = input<IProfile | null>(null);

  previousState(): void {
    window.history.back();
  }
}
