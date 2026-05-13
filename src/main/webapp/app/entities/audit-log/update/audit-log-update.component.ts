import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IAuditLog } from '../audit-log.model';
import { AuditLogService } from '../service/audit-log.service';
import { AuditLogFormGroup, AuditLogFormService } from './audit-log-form.service';

@Component({
  selector: 'hpd-audit-log-update',
  templateUrl: './audit-log-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class AuditLogUpdateComponent implements OnInit {
  isSaving = false;
  auditLog: IAuditLog | null = null;

  protected auditLogService = inject(AuditLogService);
  protected auditLogFormService = inject(AuditLogFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: AuditLogFormGroup = this.auditLogFormService.createAuditLogFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ auditLog }) => {
      this.auditLog = auditLog;
      if (auditLog) {
        this.updateForm(auditLog);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const auditLog = this.auditLogFormService.getAuditLog(this.editForm);
    if (auditLog.id !== null) {
      this.subscribeToSaveResponse(this.auditLogService.update(auditLog));
    } else {
      this.subscribeToSaveResponse(this.auditLogService.create(auditLog));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAuditLog>>): void {
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

  protected updateForm(auditLog: IAuditLog): void {
    this.auditLog = auditLog;
    this.auditLogFormService.resetForm(this.editForm, auditLog);
  }
}
