import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DocumentType } from 'app/entities/enumerations/document-type.model';
import { IDocumentItem } from '../document-item.model';
import { DocumentItemService } from '../service/document-item.service';
import { DocumentItemFormGroup, DocumentItemFormService } from './document-item-form.service';

@Component({
  selector: 'hpd-document-item-update',
  templateUrl: './document-item-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class DocumentItemUpdateComponent implements OnInit {
  isSaving = false;
  documentItem: IDocumentItem | null = null;
  documentTypeValues = Object.keys(DocumentType);

  protected documentItemService = inject(DocumentItemService);
  protected documentItemFormService = inject(DocumentItemFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: DocumentItemFormGroup = this.documentItemFormService.createDocumentItemFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ documentItem }) => {
      this.documentItem = documentItem;
      if (documentItem) {
        this.updateForm(documentItem);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const documentItem = this.documentItemFormService.getDocumentItem(this.editForm);
    if (documentItem.id !== null) {
      this.subscribeToSaveResponse(this.documentItemService.update(documentItem));
    } else {
      this.subscribeToSaveResponse(this.documentItemService.create(documentItem));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IDocumentItem>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(documentItem: IDocumentItem): void {
    this.documentItem = documentItem;
    this.documentItemFormService.resetForm(this.editForm, documentItem);
  }
}
