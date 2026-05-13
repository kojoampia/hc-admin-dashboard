import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { IPatientPlan } from '../patient-plan.model';

@Component({
  selector: 'hpd-patient-plan-detail',
  templateUrl: './patient-plan-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class PatientPlanDetailComponent {
  patientPlan = input<IPatientPlan | null>(null);

  previousState(): void {
    window.history.back();
  }
}
