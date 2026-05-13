import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { SystemCatalogService } from '../service/system-catalog.service';
import { ISystemCatalog } from '../system-catalog.model';
import { SystemCatalogFormService } from './system-catalog-form.service';

import { SystemCatalogUpdateComponent } from './system-catalog-update.component';

describe('SystemCatalog Management Update Component', () => {
  let comp: SystemCatalogUpdateComponent;
  let fixture: ComponentFixture<SystemCatalogUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let systemCatalogFormService: SystemCatalogFormService;
  let systemCatalogService: SystemCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SystemCatalogUpdateComponent],
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
      .overrideTemplate(SystemCatalogUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SystemCatalogUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    systemCatalogFormService = TestBed.inject(SystemCatalogFormService);
    systemCatalogService = TestBed.inject(SystemCatalogService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const systemCatalog: ISystemCatalog = { id: '4f0ce901-1217-4434-9c06-c1476cf6c879' };

      activatedRoute.data = of({ systemCatalog });
      comp.ngOnInit();

      expect(comp.systemCatalog).toEqual(systemCatalog);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISystemCatalog>>();
      const systemCatalog = { id: '86ac903e-8c2c-43de-abec-c0affc2b2de8' };
      jest.spyOn(systemCatalogFormService, 'getSystemCatalog').mockReturnValue(systemCatalog);
      jest.spyOn(systemCatalogService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ systemCatalog });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: systemCatalog }));
      saveSubject.complete();

      // THEN
      expect(systemCatalogFormService.getSystemCatalog).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(systemCatalogService.update).toHaveBeenCalledWith(expect.objectContaining(systemCatalog));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISystemCatalog>>();
      const systemCatalog = { id: '86ac903e-8c2c-43de-abec-c0affc2b2de8' };
      jest.spyOn(systemCatalogFormService, 'getSystemCatalog').mockReturnValue({ id: null });
      jest.spyOn(systemCatalogService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ systemCatalog: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: systemCatalog }));
      saveSubject.complete();

      // THEN
      expect(systemCatalogFormService.getSystemCatalog).toHaveBeenCalled();
      expect(systemCatalogService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISystemCatalog>>();
      const systemCatalog = { id: '86ac903e-8c2c-43de-abec-c0affc2b2de8' };
      jest.spyOn(systemCatalogService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ systemCatalog });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(systemCatalogService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
