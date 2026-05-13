import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { IAuditLog } from '../audit-log.model';

@Component({
  selector: 'hpd-audit-log-detail',
  templateUrl: './audit-log-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class AuditLogDetailComponent {
  auditLog = input<IAuditLog | null>(null);

  previousState(): void {
    window.history.back();
  }
}
