import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { CatalogType } from 'app/entities/enumerations/catalog-type.model';
import { SystemCatalogService } from '../service/system-catalog.service';
import { ISystemCatalog } from '../system-catalog.model';
import { SystemCatalogFormGroup, SystemCatalogFormService } from './system-catalog-form.service';

@Component({
  selector: 'hpd-system-catalog-update',
  templateUrl: './system-catalog-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SystemCatalogUpdateComponent implements OnInit {
  isSaving = false;
  systemCatalog: ISystemCatalog | null = null;
  catalogTypeValues = Object.keys(CatalogType);

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected systemCatalogService = inject(SystemCatalogService);
  protected systemCatalogFormService = inject(SystemCatalogFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: SystemCatalogFormGroup = this.systemCatalogFormService.createSystemCatalogFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ systemCatalog }) => {
      this.systemCatalog = systemCatalog;
      if (systemCatalog) {
        this.updateForm(systemCatalog);
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

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const systemCatalog = this.systemCatalogFormService.getSystemCatalog(this.editForm);
    if (systemCatalog.id !== null) {
      this.subscribeToSaveResponse(this.systemCatalogService.update(systemCatalog));
    } else {
      this.subscribeToSaveResponse(this.systemCatalogService.create(systemCatalog));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISystemCatalog>>): void {
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

  protected updateForm(systemCatalog: ISystemCatalog): void {
    this.systemCatalog = systemCatalog;
    this.systemCatalogFormService.resetForm(this.editForm, systemCatalog);
  }
}
