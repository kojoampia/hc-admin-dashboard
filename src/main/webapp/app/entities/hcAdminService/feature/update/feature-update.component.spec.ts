import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { FeatureService } from '../service/feature.service';
import { IFeature } from '../feature.model';
import { FeatureFormService } from './feature-form.service';

import { FeatureUpdateComponent } from './feature-update.component';

describe('Feature Management Update Component', () => {
  let comp: FeatureUpdateComponent;
  let fixture: ComponentFixture<FeatureUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let featureFormService: FeatureFormService;
  let featureService: FeatureService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FeatureUpdateComponent],
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
      .overrideTemplate(FeatureUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(FeatureUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    featureFormService = TestBed.inject(FeatureFormService);
    featureService = TestBed.inject(FeatureService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const feature: IFeature = { id: 'ba4d0840-41cd-4efd-ad24-9c999bab9ebb' };

      activatedRoute.data = of({ feature });
      comp.ngOnInit();

      expect(comp.feature).toEqual(feature);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFeature>>();
      const feature = { id: 'c9f6aa8f-47ba-4778-a4a6-6c9fc1697cb7' };
      jest.spyOn(featureFormService, 'getFeature').mockReturnValue(feature);
      jest.spyOn(featureService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ feature });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: feature }));
      saveSubject.complete();

      // THEN
      expect(featureFormService.getFeature).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(featureService.update).toHaveBeenCalledWith(expect.objectContaining(feature));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFeature>>();
      const feature = { id: 'c9f6aa8f-47ba-4778-a4a6-6c9fc1697cb7' };
      jest.spyOn(featureFormService, 'getFeature').mockReturnValue({ id: null });
      jest.spyOn(featureService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ feature: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: feature }));
      saveSubject.complete();

      // THEN
      expect(featureFormService.getFeature).toHaveBeenCalled();
      expect(featureService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFeature>>();
      const feature = { id: 'c9f6aa8f-47ba-4778-a4a6-6c9fc1697cb7' };
      jest.spyOn(featureService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ feature });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(featureService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
