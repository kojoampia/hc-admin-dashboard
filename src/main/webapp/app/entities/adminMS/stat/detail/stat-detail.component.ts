import { Component, Input } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { IStat } from '../stat.model';

@Component({
    selector: 'hpd-stat-detail',
    templateUrl: './stat-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe]
})
export class StatDetailComponent {
  @Input() stat: IStat | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  previousState(): void {
    window.history.back();
  }
}
