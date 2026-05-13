import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { PhotoType } from 'app/entities/enumerations/photo-type.model';
import { PhotoService } from '../service/photo.service';
import { IPhoto } from '../photo.model';
import { PhotoFormGroup, PhotoFormService } from './photo-form.service';

@Component({
  selector: 'hpd-photo-update',
  templateUrl: './photo-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class PhotoUpdateComponent implements OnInit {
  isSaving = false;
  photo: IPhoto | null = null;
  photoTypeValues = Object.keys(PhotoType);

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected photoService = inject(PhotoService);
  protected photoFormService = inject(PhotoFormService);
  protected elementRef = inject(ElementRef);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PhotoFormGroup = this.photoFormService.createPhotoFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ photo }) => {
      this.photo = photo;
      if (photo) {
        this.updateForm(photo);
      }
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertError>('adminDashboardApp.error', { ...err, key: `error.file.${err.key}` })),
    });
  }

  clearInputImage(field: string, fieldContentType: string, idInput: string): void {
    this.editForm.patchValue({
      [field]: null,
      [fieldContentType]: null,
    });
    if (idInput && this.elementRef.nativeElement.querySelector(`#${idInput}`)) {
      this.elementRef.nativeElement.querySelector(`#${idInput}`).value = null;
    }
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const photo = this.photoFormService.getPhoto(this.editForm);
    if (photo.id !== null) {
      this.subscribeToSaveResponse(this.photoService.update(photo));
    } else {
      this.subscribeToSaveResponse(this.photoService.create(photo));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPhoto>>): void {
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

  protected updateForm(photo: IPhoto): void {
    this.photo = photo;
    this.photoFormService.resetForm(this.editForm, photo);
  }
}
