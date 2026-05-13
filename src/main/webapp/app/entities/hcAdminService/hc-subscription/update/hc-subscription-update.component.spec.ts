import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { HCSubscriptionService } from '../service/hc-subscription.service';
import { IHCSubscription } from '../hc-subscription.model';
import { HCSubscriptionFormService } from './hc-subscription-form.service';

import { HCSubscriptionUpdateComponent } from './hc-subscription-update.component';

describe('HCSubscription Management Update Component', () => {
  let comp: HCSubscriptionUpdateComponent;
  let fixture: ComponentFixture<HCSubscriptionUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let hCSubscriptionFormService: HCSubscriptionFormService;
  let hCSubscriptionService: HCSubscriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HCSubscriptionUpdateComponent],
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
      .overrideTemplate(HCSubscriptionUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(HCSubscriptionUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    hCSubscriptionFormService = TestBed.inject(HCSubscriptionFormService);
    hCSubscriptionService = TestBed.inject(HCSubscriptionService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const hCSubscription: IHCSubscription = { id: 'c687ede1-eaaa-49d9-b522-f921052a974e' };

      activatedRoute.data = of({ hCSubscription });
      comp.ngOnInit();

      expect(comp.hCSubscription).toEqual(hCSubscription);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IHCSubscription>>();
      const hCSubscription = { id: '894d4b92-76f6-42c0-992a-9a68a729bbc3' };
      jest.spyOn(hCSubscriptionFormService, 'getHCSubscription').mockReturnValue(hCSubscription);
      jest.spyOn(hCSubscriptionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ hCSubscription });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: hCSubscription }));
      saveSubject.complete();

      // THEN
      expect(hCSubscriptionFormService.getHCSubscription).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(hCSubscriptionService.update).toHaveBeenCalledWith(expect.objectContaining(hCSubscription));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IHCSubscription>>();
      const hCSubscription = { id: '894d4b92-76f6-42c0-992a-9a68a729bbc3' };
      jest.spyOn(hCSubscriptionFormService, 'getHCSubscription').mockReturnValue({ id: null });
      jest.spyOn(hCSubscriptionService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ hCSubscription: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: hCSubscription }));
      saveSubject.complete();

      // THEN
      expect(hCSubscriptionFormService.getHCSubscription).toHaveBeenCalled();
      expect(hCSubscriptionService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IHCSubscription>>();
      const hCSubscription = { id: '894d4b92-76f6-42c0-992a-9a68a729bbc3' };
      jest.spyOn(hCSubscriptionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ hCSubscription });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(hCSubscriptionService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
