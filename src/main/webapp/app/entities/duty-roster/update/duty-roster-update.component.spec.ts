import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { DutyRosterService } from '../service/duty-roster.service';
import { IDutyRoster } from '../duty-roster.model';
import { DutyRosterFormService } from './duty-roster-form.service';

import { DutyRosterUpdateComponent } from './duty-roster-update.component';

describe('DutyRoster Management Update Component', () => {
  let comp: DutyRosterUpdateComponent;
  let fixture: ComponentFixture<DutyRosterUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let dutyRosterFormService: DutyRosterFormService;
  let dutyRosterService: DutyRosterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DutyRosterUpdateComponent],
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
      .overrideTemplate(DutyRosterUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(DutyRosterUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    dutyRosterFormService = TestBed.inject(DutyRosterFormService);
    dutyRosterService = TestBed.inject(DutyRosterService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const dutyRoster: IDutyRoster = { id: '86672097-b936-40af-b843-9a360e5aa112' };

      activatedRoute.data = of({ dutyRoster });
      comp.ngOnInit();

      expect(comp.dutyRoster).toEqual(dutyRoster);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDutyRoster>>();
      const dutyRoster = { id: '401a8b55-3dcb-46fc-bb91-cbfc48b18166' };
      jest.spyOn(dutyRosterFormService, 'getDutyRoster').mockReturnValue(dutyRoster);
      jest.spyOn(dutyRosterService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ dutyRoster });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: dutyRoster }));
      saveSubject.complete();

      // THEN
      expect(dutyRosterFormService.getDutyRoster).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(dutyRosterService.update).toHaveBeenCalledWith(expect.objectContaining(dutyRoster));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDutyRoster>>();
      const dutyRoster = { id: '401a8b55-3dcb-46fc-bb91-cbfc48b18166' };
      jest.spyOn(dutyRosterFormService, 'getDutyRoster').mockReturnValue({ id: null });
      jest.spyOn(dutyRosterService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ dutyRoster: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: dutyRoster }));
      saveSubject.complete();

      // THEN
      expect(dutyRosterFormService.getDutyRoster).toHaveBeenCalled();
      expect(dutyRosterService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDutyRoster>>();
      const dutyRoster = { id: '401a8b55-3dcb-46fc-bb91-cbfc48b18166' };
      jest.spyOn(dutyRosterService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ dutyRoster });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(dutyRosterService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
