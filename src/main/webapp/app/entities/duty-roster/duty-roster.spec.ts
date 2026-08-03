import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

import DutyRosterComponent from './duty-roster';

setupZoneTestEnv();

describe('DutyRosterComponent', () => {
  let comp: DutyRosterComponent;
  let fixture: ComponentFixture<DutyRosterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DutyRosterComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DutyRosterComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Initial state ────────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('loads 4 patients and 4 professionals on init', () => {
      expect(comp.patients().length).toBe(4);
      expect(comp.professionals().length).toBe(4);
    });

    it('defaults to the first patient (PAT-001 – Nana Kwa Otu)', () => {
      expect(comp.selectedPatientId()).toBe('PAT-001');
      expect(comp.selectedPatient()!.name).toBe('Nana Kwa Otu');
    });

    it('defaults selectedDate to today', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expect(comp.selectedDate()).toBe(today.toISOString().slice(0, 10));
    });

    it('exposes a 3-day date window', () => {
      expect(comp.dates.length).toBe(3);
    });

    it('seeds all 9 visits as UNASSIGNED before auto-schedule', () => {
      const visits = comp.visits();
      expect(visits.length).toBe(9);
      expect(visits.every(v => v.assignmentStatus === 'UNASSIGNED')).toBe(true);
    });

    it('date summary shows 9 total visits and 0 assigned', () => {
      const summary = comp.selectedDateSummary();
      expect(summary.totalVisits).toBe(9);
      expect(summary.assignedCount).toBe(0);
      expect(summary.pendingCount).toBe(9);
    });

    it('counts 4 patients in scope on the default date', () => {
      expect(comp.selectedDateSummary().patientCount).toBe(4);
    });

    it('PAT-001 plan has 4 visits in chronological order', () => {
      expect(comp.selectedPatientPlan().map(v => v.id)).toEqual(['VIS-001', 'VIS-002', 'VIS-003', 'VIS-004']);
    });

    it('patient coverage is 0% before scheduling', () => {
      expect(comp.selectedPatientCoverage()).toBe(0);
    });

    it('run summary message mentions seeded assignments before first run', () => {
      expect(comp.runSummaryMessage()).toContain('seeded assignments');
    });

    it('lastRunSummary is null before first run', () => {
      expect(comp.lastRunSummary()).toBeNull();
    });
  });

  // ─── Patient selection ────────────────────────────────────────────────────────

  describe('patient selection', () => {
    it('updates the visible plan when the user selects another patient', () => {
      comp.selectPatient('PAT-004');
      fixture.detectChanges();

      expect(comp.selectedPatient()!.name).toBe('Ama Serwaa');
      expect(comp.selectedPatientPlan().map(visit => visit.id)).toEqual(['VIS-008', 'VIS-009']);
    });

    it('switches back to PAT-001 plan correctly', () => {
      comp.selectPatient('PAT-004');
      comp.selectPatient('PAT-001');
      fixture.detectChanges();

      expect(comp.selectedPatient()!.id).toBe('PAT-001');
      expect(comp.selectedPatientPlan().length).toBe(4);
    });

    it('teamWorkload shows only TEAM_BLUE professionals for a TEAM_BLUE patient', () => {
      const ids = comp.teamWorkload().map(w => w.professional.id);
      expect(ids).toContain('PROF-001'); // Efua – NURSE TEAM_BLUE
      expect(ids).toContain('PROF-002'); // Dr. Kojo – DOCTOR TEAM_BLUE
      expect(ids).toContain('PROF-003'); // Kofi – PHYSIO TEAM_BLUE
      expect(ids).not.toContain('PROF-004'); // Abena – NURSE TEAM_GOLD
    });

    it('teamWorkload professionals are sorted alphabetically', () => {
      const names = comp.teamWorkload().map(w => w.professional.name);
      expect(names).toEqual([...names].sort());
    });
  });

  // ─── Date selection ───────────────────────────────────────────────────────────

  describe('date selection', () => {
    it('returns an empty plan when switching to a date with no visits', () => {
      comp.setDate(comp.dates[1]); // tomorrow – no visits seeded
      fixture.detectChanges();

      expect(comp.selectedPatientPlan().length).toBe(0);
    });

    it('date summary shows 0 visits for a date with no visits', () => {
      comp.setDate(comp.dates[2]); // day-after-tomorrow
      expect(comp.selectedDateSummary().totalVisits).toBe(0);
      expect(comp.selectedDateSummary().patientCount).toBe(0);
    });
  });

  // ─── Auto-schedule ────────────────────────────────────────────────────────────

  describe('auto-schedule', () => {
    it('assigns Efua Lamptey to VIS-001 (morning medication – NURSE)', () => {
      comp.autoSchedule();
      const visit = comp.selectedPatientPlan().find(v => v.id === 'VIS-001');
      expect(visit?.assignedProfessionalName).toBe('Efua Lamptey');
      expect(visit?.assignmentStatus).toBe('ASSIGNED');
    });

    it('assigns Dr. Kojo Bediako to VIS-002 (consultant round – DOCTOR)', () => {
      comp.autoSchedule();
      const visit = comp.selectedPatientPlan().find(v => v.id === 'VIS-002');
      expect(visit?.assignedProfessionalName).toBe('Dr. Kojo Bediako');
      expect(visit?.assignmentStatus).toBe('ASSIGNED');
    });

    it('produces 8 assigned and 1 pending across all patients', () => {
      comp.autoSchedule();
      expect(comp.selectedDateSummary().assignedCount).toBe(8);
      expect(comp.selectedDateSummary().pendingCount).toBe(1);
    });

    it('leaves VIS-009 (SOCIAL_WORKER) UNASSIGNED – no matching professional', () => {
      comp.autoSchedule();
      const visit = comp.visits().find(v => v.id === 'VIS-009');
      expect(visit?.assignmentStatus).toBe('UNASSIGNED');
      expect(visit?.assignmentReason).toContain('No professional matches');
    });

    it('PAT-001 reaches 100% coverage after auto-schedule', () => {
      comp.autoSchedule();
      expect(comp.selectedPatientCoverage()).toBe(100);
    });

    it('PAT-004 reaches 50% coverage (1 of 2 visits assigned)', () => {
      comp.autoSchedule();
      comp.selectPatient('PAT-004');
      expect(comp.selectedPatientCoverage()).toBe(50);
    });

    it('sets lastRunSummary with correct totals', () => {
      comp.autoSchedule();
      const summary = comp.lastRunSummary();
      expect(summary).not.toBeNull();
      expect(summary?.totalVisits).toBe(9);
      expect(summary?.assignedVisits).toBe(8);
      expect(summary?.pendingVisits).toBe(1);
    });

    it('updates the run summary message with counts after auto-schedule', () => {
      comp.autoSchedule();
      const message = comp.runSummaryMessage();
      expect(message).toContain('8 of 9');
      expect(message).toContain('1 still needing intervention');
    });

    it('does not assign professionals outside their available hours', () => {
      // PROF-002 (Dr. Kojo) is only available 08:00-16:00; VIS-001 starts at 07:30
      comp.autoSchedule();
      const visit = comp.visits().find(v => v.id === 'VIS-001');
      expect(visit?.assignedProfessionalId).not.toBe('PROF-002');
    });

    it('does not assign TEAM_GOLD professional (Abena) to TEAM_BLUE visits', () => {
      comp.autoSchedule();
      const assigned = comp.visits()
        .filter(v => v.assignmentStatus === 'ASSIGNED')
        .map(v => v.assignedProfessionalId);
      expect(assigned).not.toContain('PROF-004');
    });
  });

  // ─── Computed summaries ───────────────────────────────────────────────────────

  describe('patientScheduleSummaries', () => {
    it('builds a summary entry for each of the 4 patients', () => {
      expect(comp.patientScheduleSummaries().length).toBe(4);
    });

    it('PAT-001 summary has 4 visits with 0% coverage before schedule', () => {
      const pat = comp.patientScheduleSummaries().find(s => s.patient.id === 'PAT-001');
      expect(pat?.visits.length).toBe(4);
      expect(pat?.coveragePercent).toBe(0);
    });

    it('PAT-001 summary reaches 100% after auto-schedule', () => {
      comp.autoSchedule();
      const pat = comp.patientScheduleSummaries().find(s => s.patient.id === 'PAT-001');
      expect(pat?.coveragePercent).toBe(100);
    });

    it('PAT-004 summary reaches 50% after auto-schedule', () => {
      comp.autoSchedule();
      const pat = comp.patientScheduleSummaries().find(s => s.patient.id === 'PAT-004');
      expect(pat?.coveragePercent).toBe(50);
    });

    it('visits inside each summary are in chronological order', () => {
      const pat = comp.patientScheduleSummaries().find(s => s.patient.id === 'PAT-001');
      const starts = pat?.visits.map(v => v.start) ?? [];
      expect(starts).toEqual([...starts].sort());
    });
  });
});
