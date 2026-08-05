import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import SharedModule from 'app/shared/shared.module';
import { User } from '../user-management.model';
import { UserManagementService } from '../service/user-management.service';

@Component({
  selector: 'hpd-user-mgmt-delete-dialog',
  templateUrl: './user-management-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export default class UserManagementDeleteDialogComponent {
  private userService = inject(UserManagementService);
  private dialogRef = inject<MatDialogRef<UserManagementDeleteDialogComponent>>(MatDialogRef);

  user?: User;

  cancel(): void {
    // close() with no result: the caller filters on the 'deleted' reason, so an argument-less
    // close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(login: string): void {
    this.userService.delete(login).subscribe(() => {
      this.dialogRef.close('deleted');
    });
  }
}
