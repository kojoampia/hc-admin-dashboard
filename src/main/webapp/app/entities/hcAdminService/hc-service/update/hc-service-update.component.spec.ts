import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { HCServiceService } from '../service/hc-service.service';
import { IHCService } from '../hc-service.model';
import { HCServiceFormService } from './hc-service-form.service';

import { HCServiceUpdateComponent } from './hc-service-update.component';

describe('HCService Management Update Component', () => {
  let comp: HCServiceUpdateComponent;
  let fixture: ComponentFixture<HCServiceUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let hCServiceFormService: HCServiceFormService;
  let hCServiceService: HCServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HCServiceUpdateComponent],
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
      .overrideTemplate(HCServiceUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(HCServiceUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    hCServiceFormService = TestBed.inject(HCServiceFormService);
    hCServiceService = TestBed.inject(HCServiceService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const hCService: IHCService = { id: 'c1dbacd7-43ff-4138-ac50-0e9450f38c7e' };

      activatedRoute.data = of({ hCService });
      comp.ngOnInit();

      expect(comp.hCService).toEqual(hCService);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IHCService>>();
      const hCService = { id: '96b24cc9-2102-4e6a-a290-95b0a57bae7e' };
      jest.spyOn(hCServiceFormService, 'getHCService').mockReturnValue(hCService);
      jest.spyOn(hCServiceService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ hCService });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: hCService }));
      saveSubject.complete();

      // THEN
      expect(hCServiceFormService.getHCService).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(hCServiceService.update).toHaveBeenCalledWith(expect.objectContaining(hCService));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IHCService>>();
      const hCService = { id: '96b24cc9-2102-4e6a-a290-95b0a57bae7e' };
      jest.spyOn(hCServiceFormService, 'getHCService').mockReturnValue({ id: null });
      jest.spyOn(hCServiceService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ hCService: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: hCService }));
      saveSubject.complete();

      // THEN
      expect(hCServiceFormService.getHCService).toHaveBeenCalled();
      expect(hCServiceService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IHCService>>();
      const hCService = { id: '96b24cc9-2102-4e6a-a290-95b0a57bae7e' };
      jest.spyOn(hCServiceService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ hCService });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(hCServiceService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
