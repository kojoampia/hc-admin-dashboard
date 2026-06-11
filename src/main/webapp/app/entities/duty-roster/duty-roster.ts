import { ChangeDetectionStrategy, Component, computed, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import dayjs from 'dayjs/esm';

import { PersonService } from 'app/entities/person/service/person.service';
import { ProfessionalService } from 'app/entities/professional/service/professional.service';
import { DutyRosterService } from 'app/entities/duty-roster/service/duty-roster.service';
import { IPerson } from 'app/entities/person/person.model';
import { IProfessional } from 'app/entities/professional/professional.model';
import { IDutyRoster } from 'app/entities/duty-roster/duty-roster.model';

type TeamId = 'TEAM_BLUE' | 'TEAM_GOLD' | 'TEAM_GREEN';
type RoleId = 'DOCTOR' | 'NURSE' | 'PHYSIOTHERAPIST' | 'SOCIAL_WORKER';
type PriorityId = 'CRITICAL' | 'STANDARD' | 'ROUTINE';
type AssignmentStatus = 'ASSIGNED' | 'UNASSIGNED';

interface PatientProfile {
  id: string;
  name: string;
  age: number;
  ward: string;
  zone: string;
  teamId: TeamId;
  careLevel: string;
  focusAreas: string[];
  alerts: string[];
}

interface AvailabilityWindow {
  date: string;
  start: string;
  end: string;
}

interface ProfessionalProfile {
  id: string;
  name: string;
  role: RoleId;
  teamId: TeamId;
  primaryZone: string;
  coverageZones: string[];
  availability: AvailabilityWindow[];
}

interface ServiceVisit {
  id: string;
  patientId: string;
  date: string;
  title: string;
  start: string;
  end: string;
  durationMinutes: number;
  requiredRole: RoleId;
  zone: string;
  teamId: TeamId;
  priority: PriorityId;
  notes: string;
  preferredProfessionalId?: string;
  assignedProfessionalId?: string;
  assignedProfessionalName?: string;
  assignmentStatus: AssignmentStatus;
  assignmentReason?: string;
}

interface PatientScheduleSummary {
  patient: PatientProfile;
  visits: ServiceVisit[];
  assignedCount: number;
  coveragePercent: number;
}

interface ProfessionalWorkload {
  professional: ProfessionalProfile;
  assignedCount: number;
  assignedMinutes: number;
  availabilityLabel: string;
}

interface SchedulingRunSummary {
  totalVisits: number;
  assignedVisits: number;
  pendingVisits: number;
}

const TEAM_LABELS: Record<TeamId, string> = {
  TEAM_BLUE: 'Blue Care Team',
  TEAM_GOLD: 'Gold Community Team',
  TEAM_GREEN: 'Green Recovery Team',
};

const ROLE_LABELS: Record<RoleId, string> = {
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  PHYSIOTHERAPIST: 'Physiotherapist',
  SOCIAL_WORKER: 'Social Worker',
};

const PRIORITY_LABELS: Record<PriorityId, string> = {
  CRITICAL: 'Critical',
  STANDARD: 'Standard',
  ROUTINE: 'Routine',
};

const PRIORITY_WEIGHT: Record<PriorityId, number> = {
  CRITICAL: 3,
  STANDARD: 2,
  ROUTINE: 1,
};

const STATUS_STYLES: Record<AssignmentStatus, string> = {
  ASSIGNED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  UNASSIGNED: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
};

const availableDates = [0, 1, 2].map(offset => buildIsoDate(offset));

function buildIsoDate(offsetDays: number): string {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  value.setDate(value.getDate() + offsetDays);
  return value.toISOString().slice(0, 10);
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function overlaps(left: ServiceVisit, right: ServiceVisit): boolean {
  return timeToMinutes(left.start) < timeToMinutes(right.end) && timeToMinutes(left.end) > timeToMinutes(right.start);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${value}T00:00:00`));
}

function formatTeam(teamId: TeamId): string {
  return TEAM_LABELS[teamId];
}

function formatRole(roleId: RoleId): string {
  return ROLE_LABELS[roleId];
}

function formatPriority(priority: PriorityId): string {
  return PRIORITY_LABELS[priority];
}

function describeAvailability(professional: ProfessionalProfile, date: string): string {
  const slot = professional.availability.find(item => item.date === date);
  return slot ? `${slot.start} - ${slot.end}` : 'Unavailable';
}

@Component({
  selector: 'hpd-duty-roster',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './duty-roster.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DutyRosterComponent implements OnInit {
  private personService = inject(PersonService);
  private professionalService = inject(ProfessionalService);
  private dutyRosterService = inject(DutyRosterService);

  readonly patients = signal<PatientProfile[]>([]);
  readonly professionals = signal<ProfessionalProfile[]>([]);
  readonly dates = availableDates;
  readonly selectedPatientId = signal<string | null>(null);
  readonly selectedDate = signal(this.dates[0]);
  readonly visits = signal<ServiceVisit[]>([]);
  readonly lastRunSummary = signal<SchedulingRunSummary | null>(null);

  readonly selectedPatient = computed(
    () => this.patients().find(patient => patient.id === this.selectedPatientId()) ?? this.patients()[0],
  );
  readonly selectedPatientPlan = computed(() =>
    this.visits()
      .filter(visit => visit.patientId === this.selectedPatientId() && visit.date === this.selectedDate())
      .sort((left, right) => left.start.localeCompare(right.start)),
  );
  readonly selectedPatientCoverage = computed(() => {
    const visitsForPatient = this.selectedPatientPlan();

    if (visitsForPatient.length === 0) {
      return 0;
    }

    return Math.round((visitsForPatient.filter(visit => visit.assignmentStatus === 'ASSIGNED').length / visitsForPatient.length) * 100);
  });
  readonly patientScheduleSummaries = computed<PatientScheduleSummary[]>(() =>
    this.patients().map(patient => {
      const patientVisits = this.visits()
        .filter(visit => visit.patientId === patient.id && visit.date === this.selectedDate())
        .sort((left, right) => left.start.localeCompare(right.start));
      const assignedCount = patientVisits.filter(visit => visit.assignmentStatus === 'ASSIGNED').length;

      return {
        patient,
        visits: patientVisits,
        assignedCount,
        coveragePercent: patientVisits.length === 0 ? 0 : Math.round((assignedCount / patientVisits.length) * 100),
      };
    }),
  );
  readonly selectedDateSummary = computed(() => {
    const visitsForDate = this.visits().filter(visit => visit.date === this.selectedDate());
    const assignedCount = visitsForDate.filter(visit => visit.assignmentStatus === 'ASSIGNED').length;

    return {
      patientCount: new Set(visitsForDate.map(visit => visit.patientId)).size,
      totalVisits: visitsForDate.length,
      assignedCount,
      pendingCount: visitsForDate.length - assignedCount,
      coveragePercent: visitsForDate.length === 0 ? 0 : Math.round((assignedCount / visitsForDate.length) * 100),
    };
  });
  readonly teamWorkload = computed<ProfessionalWorkload[]>(() => {
    const patient = this.selectedPatient();
    if (!patient) return [];

    const visitsForDate = this.visits().filter(visit => visit.date === this.selectedDate());

    return this.professionals()
      .filter(professional => professional.teamId === patient.teamId)
      .map(professional => {
        const assignedVisits = visitsForDate.filter(visit => visit.assignedProfessionalId === professional.id);

        return {
          professional,
          assignedCount: assignedVisits.length,
          assignedMinutes: assignedVisits.reduce((total, visit) => total + visit.durationMinutes, 0),
          availabilityLabel: describeAvailability(professional, this.selectedDate()),
        };
      })
      .sort((left, right) => left.professional.name.localeCompare(right.professional.name));
  });
  readonly runSummaryMessage = computed(() => {
    const summary = this.lastRunSummary();

    if (!summary) {
      return 'Using seeded assignments. Run auto-schedule to rebalance the full roster.';
    }

    return `${summary.assignedVisits} of ${summary.totalVisits} visits assigned automatically with ${summary.pendingVisits} still needing intervention.`;
  });

  readonly formatDate = formatDate;
  readonly formatPriority = formatPriority;
  readonly formatRole = formatRole;
  readonly formatTeam = formatTeam;
  readonly statusStyles = STATUS_STYLES;

  ngOnInit(): void {
    forkJoin({
      people: this.personService.query(),
      professionals: this.professionalService.query(),
      dutyRosters: this.dutyRosterService.query(),
    }).subscribe(({ people, professionals, dutyRosters }) => {
      const mappedPatients = (people.body ?? []).map(p => this.mapPersonToPatient(p));
      const mappedProfessionals = (professionals.body ?? []).map(p => this.mapProfessionalToProfile(p));
      const mappedVisits = (dutyRosters.body ?? []).map(dr => this.mapDutyRosterToVisit(dr, mappedProfessionals));

      this.patients.set(mappedPatients);
      this.professionals.set(mappedProfessionals);
      this.visits.set(mappedVisits);

      if (mappedPatients.length > 0) {
        this.selectedPatientId.set(mappedPatients[0].id);
      }
    });
  }

  selectPatient(patientId: string): void {
    this.selectedPatientId.set(patientId);
  }

  setDate(date: string): void {
    this.selectedDate.set(date);
  }

  autoSchedule(): void {
    const result = this.assignVisits(this.visits());
    this.visits.set(result.visits);
    this.lastRunSummary.set(result.summary);
  }

  private mapPersonToPatient(person: IPerson): PatientProfile {
    return {
      id: person.id,
      name: `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim() || 'Unknown Patient',
      age: person.birthDate ? dayjs().diff(person.birthDate, 'year') : 0,
      ward: 'Cardiac Stepdown',
      zone: 'Accra Central',
      teamId: 'TEAM_BLUE',
      careLevel: 'Post-operative monitoring',
      focusAreas: ['Medication adherence', 'Blood pressure checks', 'Mobility support'],
      alerts: ['Fall risk', 'Low sodium diet'],
    };
  }

  private mapProfessionalToProfile(prof: IProfessional): ProfessionalProfile {
    return {
      id: prof.id,
      name: prof.name ?? 'Unknown Professional',
      role: 'NURSE',
      teamId: 'TEAM_BLUE',
      primaryZone: 'Accra Central',
      coverageZones: ['Accra Central', 'Osu'],
      availability: this.dates.map(date => ({ date, start: '07:00', end: '15:00' })),
    };
  }

  private mapDutyRosterToVisit(dr: IDutyRoster, professionals: ProfessionalProfile[]): ServiceVisit {
    const roleMap: Record<string, RoleId> = {
      DOCTOR: 'DOCTOR',
      NURSE: 'NURSE',
      CARE: 'NURSE',
      MEDIC: 'DOCTOR',
    };

    const assignedProf = professionals.find(p => p.id === dr.professionalId);

    return {
      id: dr.id,
      patientId: dr.patientId ?? '',
      date: dr.date?.format('YYYY-MM-DD') ?? this.dates[0],
      title: dr.name ?? dr.description ?? 'Morning medication round',
      start: '07:30',
      end: '08:15',
      durationMinutes: 45,
      requiredRole: (dr.duty && roleMap[dr.duty]) || 'NURSE',
      zone: 'Accra Central',
      teamId: 'TEAM_BLUE',
      priority: 'CRITICAL',
      notes: dr.description ?? 'Confirm anticoagulant dosage and hydration prompts.',
      preferredProfessionalId: dr.professionalId ?? undefined,
      assignedProfessionalId: dr.professionalId ?? undefined,
      assignedProfessionalName: assignedProf?.name,
      assignmentStatus: dr.professionalId ? 'ASSIGNED' : 'UNASSIGNED',
      assignmentReason: dr.professionalId ? 'Seeded continuity assignment.' : 'Awaiting auto-scheduling.',
    };
  }

  private assignVisits(visits: ServiceVisit[]): { visits: ServiceVisit[]; summary: SchedulingRunSummary } {
    const scheduledByProfessional = new Map<string, ServiceVisit[]>();
    const currentProfessionals = this.professionals();

    const rankedVisits = [...visits].sort((left, right) => {
      if (left.date !== right.date) {
        return left.date.localeCompare(right.date);
      }

      if (left.start !== right.start) {
        return left.start.localeCompare(right.start);
      }

      return PRIORITY_WEIGHT[right.priority] - PRIORITY_WEIGHT[left.priority];
    });

    const assignedVisits: ServiceVisit[] = rankedVisits.map(visit => {
      const eligibleProfessionals = currentProfessionals
        .filter(professional => professional.role === visit.requiredRole)
        .filter(professional => professional.teamId === visit.teamId)
        .filter(professional => professional.coverageZones.includes(visit.zone))
        .filter(professional =>
          professional.availability.some(
            slot => slot.date === visit.date && slot.start <= visit.start && slot.end >= visit.end,
          ),
        )
        .filter(professional =>
          (scheduledByProfessional.get(professional.id) ?? []).every(existingVisit => !overlaps(existingVisit, visit)),
        )
        .map(professional => {
          const currentAssignments = scheduledByProfessional.get(professional.id) ?? [];
          const score =
            (professional.id === visit.preferredProfessionalId ? 40 : 0) +
            (professional.primaryZone === visit.zone ? 20 : 10) -
            currentAssignments.length * 5 -
            currentAssignments.reduce((total, item) => total + item.durationMinutes, 0) / 30;

          return { professional, score, assignedCount: currentAssignments.length };
        })
        .sort((left, right) => {
          if (right.score !== left.score) {
            return right.score - left.score;
          }

          if (left.assignedCount !== right.assignedCount) {
            return left.assignedCount - right.assignedCount;
          }

          return left.professional.name.localeCompare(right.professional.name);
        });

      if (eligibleProfessionals.length === 0) {
        const pendingVisit: ServiceVisit = {
          ...visit,
          assignedProfessionalId: undefined,
          assignedProfessionalName: undefined,
          assignmentStatus: 'UNASSIGNED',
          assignmentReason: 'No professional matches team, zone, date, and time constraints.',
        };

        return pendingVisit;
      }

      const selectedProfessional = eligibleProfessionals[0].professional;

      const scheduledVisit: ServiceVisit = {
        ...visit,
        assignedProfessionalId: selectedProfessional.id,
        assignedProfessionalName: selectedProfessional.name,
        assignmentStatus: 'ASSIGNED',
        assignmentReason: 'Assigned by continuity, zone match, and availability score.',
      };

      scheduledByProfessional.set(selectedProfessional.id, [
        ...(scheduledByProfessional.get(selectedProfessional.id) ?? []),
        scheduledVisit,
      ]);

      return scheduledVisit;
    });

    const assignedCount = assignedVisits.filter(visit => visit.assignmentStatus === 'ASSIGNED').length;

    return {
      visits: assignedVisits,
      summary: {
        totalVisits: assignedVisits.length,
        assignedVisits: assignedCount,
        pendingVisits: assignedVisits.length - assignedCount,
      },
    };
  }
}

export default DutyRosterComponent;
