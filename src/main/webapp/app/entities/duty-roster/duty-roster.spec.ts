import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

import DutyRosterComponent from './duty-roster';

setupZoneTestEnv();

describe('DutyRosterComponent', () => {
  let comp: DutyRosterComponent;
  let fixture: ComponentFixture<DutyRosterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DutyRosterComponent, RouterTestingModule.withRoutes([])],
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DutyRosterComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('auto-schedules visits using matching team and availability rules', () => {
    comp.autoSchedule();

    const selectedPlan = comp.selectedPatientPlan();
    const medicationRound = selectedPlan.find(visit => visit.id === 'VIS-001');
    const consultantReview = selectedPlan.find(visit => visit.id === 'VIS-002');

    expect(medicationRound?.assignedProfessionalName).toBe('Efua Lamptey');
    expect(consultantReview?.assignedProfessionalName).toBe('Dr. Kojo Bediako');
    expect(comp.selectedDateSummary().assignedCount).toBe(8);
    expect(comp.selectedDateSummary().pendingCount).toBe(1);
  });

  it('updates the visible plan when the user selects another patient', () => {
    comp.selectPatient('PAT-004');
    fixture.detectChanges();

    expect(comp.selectedPatient().name).toBe('Ama Serwaa');
    expect(comp.selectedPatientPlan().map(visit => visit.id)).toEqual(['VIS-008', 'VIS-009']);
  });
});
