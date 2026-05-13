import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IDutyRoster } from '../duty-roster.model';
import { DutyRosterService } from '../service/duty-roster.service';

@Component({
  templateUrl: './duty-roster-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class DutyRosterDeleteDialogComponent {
  dutyRoster?: IDutyRoster;

  protected dutyRosterService = inject(DutyRosterService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.dutyRosterService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
