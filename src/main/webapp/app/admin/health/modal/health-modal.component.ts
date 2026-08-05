import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import SharedModule from 'app/shared/shared.module';
import { HealthKey, HealthDetails } from '../health.model';

@Component({
  selector: 'hpd-health-modal',
  templateUrl: './health-modal.component.html',
  imports: [SharedModule, MatDialogModule],
})
export default class HealthModalComponent {
  private dialogRef = inject<MatDialogRef<HealthModalComponent>>(MatDialogRef);

  health?: { key: HealthKey; value: HealthDetails };

  readableValue(value: any): string {
    if (this.health?.key === 'diskSpace') {
      // Should display storage space in an human readable unit
      const val = value / 1073741824;
      if (val > 1) {
        return `${val.toFixed(2)} GB`;
      }
      return `${(value / 1048576).toFixed(2)} MB`;
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  dismiss(): void {
    this.dialogRef.close();
  }
}
