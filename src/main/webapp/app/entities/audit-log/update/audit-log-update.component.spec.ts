import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { AuditLogService } from '../service/audit-log.service';
import { IAuditLog } from '../audit-log.model';
import { AuditLogFormService } from './audit-log-form.service';

import { AuditLogUpdateComponent } from './audit-log-update.component';

describe('AuditLog Management Update Component', () => {
  let comp: AuditLogUpdateComponent;
  let fixture: ComponentFixture<AuditLogUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let auditLogFormService: AuditLogFormService;
  let auditLogService: AuditLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AuditLogUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(AuditLogUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(AuditLogUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    auditLogFormService = TestBed.inject(AuditLogFormService);
    auditLogService = TestBed.inject(AuditLogService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const auditLog: IAuditLog = { id: '3cd293e7-61a9-4351-9411-9576d8593849' };

      activatedRoute.data = of({ auditLog });
      comp.ngOnInit();

      expect(comp.auditLog).toEqual(auditLog);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAuditLog>>();
      const auditLog = { id: 'ccc9ca42-f95c-4b2b-a00d-7c54df66be4c' };
      jest.spyOn(auditLogFormService, 'getAuditLog').mockReturnValue(auditLog);
      jest.spyOn(auditLogService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ auditLog });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: auditLog }));
      saveSubject.complete();

      // THEN
      expect(auditLogFormService.getAuditLog).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(auditLogService.update).toHaveBeenCalledWith(expect.objectContaining(auditLog));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAuditLog>>();
      const auditLog = { id: 'ccc9ca42-f95c-4b2b-a00d-7c54df66be4c' };
      jest.spyOn(auditLogFormService, 'getAuditLog').mockReturnValue({ id: null });
      jest.spyOn(auditLogService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ auditLog: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: auditLog }));
      saveSubject.complete();

      // THEN
      expect(auditLogFormService.getAuditLog).toHaveBeenCalled();
      expect(auditLogService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAuditLog>>();
      const auditLog = { id: 'ccc9ca42-f95c-4b2b-a00d-7c54df66be4c' };
      jest.spyOn(auditLogService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ auditLog });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(auditLogService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
