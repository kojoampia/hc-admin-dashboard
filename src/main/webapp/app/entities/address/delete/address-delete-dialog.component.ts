import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IAddress } from '../address.model';
import { AddressService } from '../service/address.service';

@Component({
  templateUrl: './address-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class AddressDeleteDialogComponent {
  address?: IAddress;

  protected addressService = inject(AddressService);
  protected dialogRef = inject(MatDialogRef<AddressDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.addressService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}
