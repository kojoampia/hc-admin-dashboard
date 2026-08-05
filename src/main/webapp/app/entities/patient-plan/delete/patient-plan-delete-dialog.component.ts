import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IPatientPlan } from '../patient-plan.model';
import { PatientPlanService } from '../service/patient-plan.service';

@Component({
  templateUrl: './patient-plan-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class PatientPlanDeleteDialogComponent {
  patientPlan?: IPatientPlan;

  protected patientPlanService = inject(PatientPlanService);
  protected dialogRef = inject(MatDialogRef<PatientPlanDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.patientPlanService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}
