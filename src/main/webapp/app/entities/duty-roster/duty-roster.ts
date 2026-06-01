import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

const patients: PatientProfile[] = [
  {
    id: 'PAT-001',
    name: 'Nana Otu',
    age: 68,
    ward: 'Cardiac Stepdown',
    zone: 'Accra Central',
    teamId: 'TEAM_BLUE',
    careLevel: 'Post-operative monitoring',
    focusAreas: ['Medication adherence', 'Blood pressure checks', 'Mobility support'],
    alerts: ['Fall risk', 'Low sodium diet'],
  },
  {
    id: 'PAT-002',
    name: 'Afia Mensah',
    age: 56,
    ward: 'Community Recovery',
    zone: 'East Legon',
    teamId: 'TEAM_GOLD',
    careLevel: 'Diabetes stabilisation',
    focusAreas: ['Insulin review', 'Nutrition coaching'],
    alerts: ['Evening insulin', 'Monitor dizziness'],
  },
  {
    id: 'PAT-003',
    name: 'Kwame Addo',
    age: 73,
    ward: 'Neurology Outreach',
    zone: 'Osu',
    teamId: 'TEAM_BLUE',
    careLevel: 'Stroke rehabilitation',
    focusAreas: ['Mobility therapy', 'Family handoff', 'Speech pacing'],
    alerts: ['Wheelchair transfer', 'Hydration watch'],
  },
  {
    id: 'PAT-004',
    name: 'Ama Serwaa',
    age: 61,
    ward: 'Home Care Transition',
    zone: 'Tema Community 5',
    teamId: 'TEAM_GREEN',
    careLevel: 'Pulmonary recovery',
    focusAreas: ['Respiratory checks', 'Social support'],
    alerts: ['Portable oxygen', 'Discharge follow-up'],
  },
];

const professionals: ProfessionalProfile[] = [
  {
    id: 'PRO-101',
    name: 'Efua Lamptey',
    role: 'NURSE',
    teamId: 'TEAM_BLUE',
    primaryZone: 'Accra Central',
    coverageZones: ['Accra Central', 'Osu'],
    availability: [
      { date: availableDates[0], start: '07:00', end: '15:00' },
      { date: availableDates[1], start: '07:00', end: '15:00' },
      { date: availableDates[2], start: '07:00', end: '13:00' },
    ],
  },
  {
    id: 'PRO-102',
    name: 'Dr. Kojo Bediako',
    role: 'DOCTOR',
    teamId: 'TEAM_BLUE',
    primaryZone: 'Accra Central',
    coverageZones: ['Accra Central', 'Osu'],
    availability: [
      { date: availableDates[0], start: '08:30', end: '12:30' },
      { date: availableDates[1], start: '08:30', end: '12:30' },
    ],
  },
  {
    id: 'PRO-103',
    name: 'Yaw Asare',
    role: 'PHYSIOTHERAPIST',
    teamId: 'TEAM_BLUE',
    primaryZone: 'Osu',
    coverageZones: ['Accra Central', 'Osu'],
    availability: [
      { date: availableDates[0], start: '14:00', end: '18:00' },
      { date: availableDates[1], start: '09:00', end: '17:00' },
      { date: availableDates[2], start: '09:00', end: '15:00' },
    ],
  },
  {
    id: 'PRO-201',
    name: 'Lydia Mensimah',
    role: 'NURSE',
    teamId: 'TEAM_GOLD',
    primaryZone: 'East Legon',
    coverageZones: ['East Legon'],
    availability: [
      { date: availableDates[0], start: '07:00', end: '16:00' },
      { date: availableDates[1], start: '07:00', end: '16:00' },
      { date: availableDates[2], start: '08:00', end: '14:00' },
    ],
  },
  {
    id: 'PRO-202',
    name: 'Dr. Zuri Coleman',
    role: 'DOCTOR',
    teamId: 'TEAM_GOLD',
    primaryZone: 'East Legon',
    coverageZones: ['East Legon'],
    availability: [
      { date: availableDates[0], start: '10:00', end: '14:00' },
      { date: availableDates[1], start: '08:30', end: '14:30' },
      { date: availableDates[2], start: '08:30', end: '12:30' },
    ],
  },
  {
    id: 'PRO-301',
    name: 'Kofi Antwi',
    role: 'NURSE',
    teamId: 'TEAM_GREEN',
    primaryZone: 'Tema Community 5',
    coverageZones: ['Tema Community 5'],
    availability: [
      { date: availableDates[0], start: '07:30', end: '12:30' },
      { date: availableDates[1], start: '07:30', end: '12:30' },
      { date: availableDates[2], start: '07:30', end: '12:30' },
    ],
  },
  {
    id: 'PRO-302',
    name: 'Naana Quaye',
    role: 'SOCIAL_WORKER',
    teamId: 'TEAM_GREEN',
    primaryZone: 'Tema Community 5',
    coverageZones: ['Tema Community 5'],
    availability: [
      { date: availableDates[0], start: '09:00', end: '15:00' },
      { date: availableDates[1], start: '09:00', end: '17:00' },
      { date: availableDates[2], start: '09:00', end: '15:00' },
    ],
  },
];

const visitBlueprints: Omit<
  ServiceVisit,
  'assignedProfessionalId' | 'assignedProfessionalName' | 'assignmentStatus' | 'assignmentReason'
>[] = [
  {
    id: 'VIS-001',
    patientId: 'PAT-001',
    date: availableDates[0],
    title: 'Morning medication round',
    start: '07:30',
    end: '08:15',
    durationMinutes: 45,
    requiredRole: 'NURSE',
    zone: 'Accra Central',
    teamId: 'TEAM_BLUE',
    priority: 'CRITICAL',
    notes: 'Confirm anticoagulant dosage and hydration prompts.',
    preferredProfessionalId: 'PRO-101',
  },
  {
    id: 'VIS-002',
    patientId: 'PAT-001',
    date: availableDates[0],
    title: 'Consultant review',
    start: '09:00',
    end: '09:30',
    durationMinutes: 30,
    requiredRole: 'DOCTOR',
    zone: 'Accra Central',
    teamId: 'TEAM_BLUE',
    priority: 'STANDARD',
    notes: 'Review telemetry and discharge markers.',
    preferredProfessionalId: 'PRO-102',
  },
  {
    id: 'VIS-003',
    patientId: 'PAT-001',
    date: availableDates[0],
    title: 'Mobility coaching',
    start: '16:00',
    end: '16:45',
    durationMinutes: 45,
    requiredRole: 'PHYSIOTHERAPIST',
    zone: 'Accra Central',
    teamId: 'TEAM_BLUE',
    priority: 'STANDARD',
    notes: 'Progress stair tolerance and balance drills.',
    preferredProfessionalId: 'PRO-103',
  },
  {
    id: 'VIS-004',
    patientId: 'PAT-002',
    date: availableDates[0],
    title: 'Nutrition and insulin review',
    start: '10:30',
    end: '11:15',
    durationMinutes: 45,
    requiredRole: 'DOCTOR',
    zone: 'East Legon',
    teamId: 'TEAM_GOLD',
    priority: 'STANDARD',
    notes: 'Adjust meal timing around insulin window.',
    preferredProfessionalId: 'PRO-202',
  },
  {
    id: 'VIS-005',
    patientId: 'PAT-002',
    date: availableDates[0],
    title: 'Glucose observation',
    start: '08:00',
    end: '08:30',
    durationMinutes: 30,
    requiredRole: 'NURSE',
    zone: 'East Legon',
    teamId: 'TEAM_GOLD',
    priority: 'CRITICAL',
    notes: 'Capture fasting glucose and reinforce escalation plan.',
    preferredProfessionalId: 'PRO-201',
  },
  {
    id: 'VIS-006',
    patientId: 'PAT-003',
    date: availableDates[0],
    title: 'Functional gait session',
    start: '14:30',
    end: '15:15',
    durationMinutes: 45,
    requiredRole: 'PHYSIOTHERAPIST',
    zone: 'Osu',
    teamId: 'TEAM_BLUE',
    priority: 'STANDARD',
    notes: 'Use walker support and fatigue scoring.',
    preferredProfessionalId: 'PRO-103',
  },
  {
    id: 'VIS-007',
    patientId: 'PAT-003',
    date: availableDates[0],
    title: 'Pressure-area check',
    start: '11:30',
    end: '12:00',
    durationMinutes: 30,
    requiredRole: 'NURSE',
    zone: 'Osu',
    teamId: 'TEAM_BLUE',
    priority: 'STANDARD',
    notes: 'Inspect brace contact points and hydration status.',
    preferredProfessionalId: 'PRO-101',
  },
  {
    id: 'VIS-008',
    patientId: 'PAT-004',
    date: availableDates[0],
    title: 'Respiratory observation',
    start: '08:30',
    end: '09:00',
    durationMinutes: 30,
    requiredRole: 'NURSE',
    zone: 'Tema Community 5',
    teamId: 'TEAM_GREEN',
    priority: 'CRITICAL',
    notes: 'Check oxygen saturation and inhaler technique.',
    preferredProfessionalId: 'PRO-301',
  },
  {
    id: 'VIS-009',
    patientId: 'PAT-004',
    date: availableDates[0],
    title: 'Family discharge support',
    start: '15:30',
    end: '16:00',
    durationMinutes: 30,
    requiredRole: 'SOCIAL_WORKER',
    zone: 'Tema Community 5',
    teamId: 'TEAM_GREEN',
    priority: 'ROUTINE',
    notes: 'Walk through home handoff checklist with relatives.',
    preferredProfessionalId: 'PRO-302',
  },
  {
    id: 'VIS-010',
    patientId: 'PAT-001',
    date: availableDates[1],
    title: 'Post-op wound care',
    start: '08:00',
    end: '08:45',
    durationMinutes: 45,
    requiredRole: 'NURSE',
    zone: 'Accra Central',
    teamId: 'TEAM_BLUE',
    priority: 'CRITICAL',
    notes: 'Sterile dressing change and pain score.',
    preferredProfessionalId: 'PRO-101',
  },
  {
    id: 'VIS-011',
    patientId: 'PAT-002',
    date: availableDates[1],
    title: 'Doctor follow-up',
    start: '09:30',
    end: '10:00',
    durationMinutes: 30,
    requiredRole: 'DOCTOR',
    zone: 'East Legon',
    teamId: 'TEAM_GOLD',
    priority: 'STANDARD',
    notes: 'Review overnight readings and patient education.',
    preferredProfessionalId: 'PRO-202',
  },
  {
    id: 'VIS-012',
    patientId: 'PAT-003',
    date: availableDates[1],
    title: 'Home exercise refresh',
    start: '11:00',
    end: '11:45',
    durationMinutes: 45,
    requiredRole: 'PHYSIOTHERAPIST',
    zone: 'Osu',
    teamId: 'TEAM_BLUE',
    priority: 'STANDARD',
    notes: 'Rehearse seated balance circuit and caregiver prompts.',
    preferredProfessionalId: 'PRO-103',
  },
  {
    id: 'VIS-013',
    patientId: 'PAT-004',
    date: availableDates[1],
    title: 'Community support check-in',
    start: '13:30',
    end: '14:00',
    durationMinutes: 30,
    requiredRole: 'SOCIAL_WORKER',
    zone: 'Tema Community 5',
    teamId: 'TEAM_GREEN',
    priority: 'STANDARD',
    notes: 'Confirm transport and benefits paperwork.',
    preferredProfessionalId: 'PRO-302',
  },
  {
    id: 'VIS-014',
    patientId: 'PAT-002',
    date: availableDates[2],
    title: 'Insulin plan sign-off',
    start: '09:00',
    end: '09:30',
    durationMinutes: 30,
    requiredRole: 'DOCTOR',
    zone: 'East Legon',
    teamId: 'TEAM_GOLD',
    priority: 'STANDARD',
    notes: 'Finalise community dosage instructions.',
    preferredProfessionalId: 'PRO-202',
  },
];

const initialAssignments = new Map<string, string>([
  ['VIS-001', 'PRO-101'],
  ['VIS-005', 'PRO-201'],
  ['VIS-008', 'PRO-301'],
]);

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

function buildInitialVisits(): ServiceVisit[] {
  return visitBlueprints.map(visit => {
    const assignedProfessionalId = initialAssignments.get(visit.id);
    const professional = professionals.find(item => item.id === assignedProfessionalId);

    return {
      ...visit,
      assignedProfessionalId,
      assignedProfessionalName: professional?.name,
      assignmentStatus: professional ? 'ASSIGNED' : 'UNASSIGNED',
      assignmentReason: professional ? 'Seeded continuity assignment.' : 'Awaiting auto-scheduling.',
    };
  });
}

function assignVisits(visits: ServiceVisit[]): { visits: ServiceVisit[]; summary: SchedulingRunSummary } {
  const scheduledByProfessional = new Map<string, ServiceVisit[]>();
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
    const eligibleProfessionals = professionals
      .filter(professional => professional.role === visit.requiredRole)
      .filter(professional => professional.teamId === visit.teamId)
      .filter(professional => professional.coverageZones.includes(visit.zone))
      .filter(professional =>
        professional.availability.some(slot => slot.date === visit.date && slot.start <= visit.start && slot.end >= visit.end),
      )
      .filter(professional => (scheduledByProfessional.get(professional.id) ?? []).every(existingVisit => !overlaps(existingVisit, visit)))
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

    scheduledByProfessional.set(selectedProfessional.id, [...(scheduledByProfessional.get(selectedProfessional.id) ?? []), scheduledVisit]);

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

@Component({
  selector: 'hpd-duty-roster',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './duty-roster.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DutyRosterComponent {
  readonly patients = patients;
  readonly professionals = professionals;
  readonly dates = availableDates;
  readonly selectedPatientId = signal(this.patients[0].id);
  readonly selectedDate = signal(this.dates[0]);
  readonly visits = signal(buildInitialVisits());
  readonly lastRunSummary = signal<SchedulingRunSummary | null>(null);

  readonly selectedPatient = computed(() => this.patients.find(patient => patient.id === this.selectedPatientId()) ?? this.patients[0]);
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
    this.patients.map(patient => {
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
    const visitsForDate = this.visits().filter(visit => visit.date === this.selectedDate());

    return this.professionals
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

  selectPatient(patientId: string): void {
    this.selectedPatientId.set(patientId);
  }

  setDate(date: string): void {
    this.selectedDate.set(date);
  }

  autoSchedule(): void {
    const result = assignVisits(this.visits());
    this.visits.set(result.visits);
    this.lastRunSummary.set(result.summary);
  }
}

export default DutyRosterComponent;
