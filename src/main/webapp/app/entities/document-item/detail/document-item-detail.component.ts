import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { IDocumentItem } from '../document-item.model';

@Component({
  selector: 'hpd-document-item-detail',
  templateUrl: './document-item-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class DocumentItemDetailComponent {
  documentItem = input<IDocumentItem | null>(null);

  previousState(): void {
    window.history.back();
  }
}
