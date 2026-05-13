import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

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
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.patientPlanService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
