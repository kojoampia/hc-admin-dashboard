import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IProfile } from '../profile.model';
import { ProfileService } from '../service/profile.service';

@Component({
  templateUrl: './profile-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ProfileDeleteDialogComponent {
  profile?: IProfile;

  protected profileService = inject(ProfileService);
  protected dialogRef = inject(MatDialogRef<ProfileDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.profileService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}
