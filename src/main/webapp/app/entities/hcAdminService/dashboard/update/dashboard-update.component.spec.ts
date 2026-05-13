import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { DashboardService } from '../service/dashboard.service';
import { IDashboard } from '../dashboard.model';
import { DashboardFormService } from './dashboard-form.service';

import { DashboardUpdateComponent } from './dashboard-update.component';

describe('Dashboard Management Update Component', () => {
  let comp: DashboardUpdateComponent;
  let fixture: ComponentFixture<DashboardUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let dashboardFormService: DashboardFormService;
  let dashboardService: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardUpdateComponent],
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
      .overrideTemplate(DashboardUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(DashboardUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    dashboardFormService = TestBed.inject(DashboardFormService);
    dashboardService = TestBed.inject(DashboardService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const dashboard: IDashboard = { id: '220ca314-dada-442e-9dd8-98aa3505bb16' };

      activatedRoute.data = of({ dashboard });
      comp.ngOnInit();

      expect(comp.dashboard).toEqual(dashboard);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDashboard>>();
      const dashboard = { id: 'aa4e6674-9d45-45d3-a0ea-50ff8f71b932' };
      jest.spyOn(dashboardFormService, 'getDashboard').mockReturnValue(dashboard);
      jest.spyOn(dashboardService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ dashboard });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: dashboard }));
      saveSubject.complete();

      // THEN
      expect(dashboardFormService.getDashboard).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(dashboardService.update).toHaveBeenCalledWith(expect.objectContaining(dashboard));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDashboard>>();
      const dashboard = { id: 'aa4e6674-9d45-45d3-a0ea-50ff8f71b932' };
      jest.spyOn(dashboardFormService, 'getDashboard').mockReturnValue({ id: null });
      jest.spyOn(dashboardService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ dashboard: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: dashboard }));
      saveSubject.complete();

      // THEN
      expect(dashboardFormService.getDashboard).toHaveBeenCalled();
      expect(dashboardService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDashboard>>();
      const dashboard = { id: 'aa4e6674-9d45-45d3-a0ea-50ff8f71b932' };
      jest.spyOn(dashboardService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ dashboard });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(dashboardService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
