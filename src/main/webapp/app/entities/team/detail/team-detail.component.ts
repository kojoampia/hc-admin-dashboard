import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { ITeam } from '../team.model';

@Component({
  selector: 'hpd-team-detail',
  templateUrl: './team-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class TeamDetailComponent {
  team = input<ITeam | null>(null);

  previousState(): void {
    window.history.back();
  }
}
