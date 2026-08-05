import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IPerson } from '../person.model';
import { PersonService } from '../service/person.service';

@Component({
  templateUrl: './person-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class PersonDeleteDialogComponent {
  person?: IPerson;

  protected personService = inject(PersonService);
  protected dialogRef = inject(MatDialogRef<PersonDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.personService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}
