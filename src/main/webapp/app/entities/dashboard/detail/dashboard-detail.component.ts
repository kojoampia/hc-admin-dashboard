import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IDashboard } from '../dashboard.model';

@Component({
  selector: 'hpd-dashboard-detail',
  templateUrl: './dashboard-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class DashboardDetailComponent {
  dashboard = input<IDashboard | null>(null);

  previousState(): void {
    window.history.back();
  }
}
