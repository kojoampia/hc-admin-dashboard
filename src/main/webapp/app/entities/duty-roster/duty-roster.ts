import { ChangeDetectionStrategy, Component, computed, signal, OnInit } from '@angular/core';

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
  ASSIGNED: 'bg-hpd-success-tint text-hpd-success ring-1 ring-hpd-success-accent/30',
  UNASSIGNED: 'bg-hpd-warning-tint text-hpd-warning ring-1 ring-hpd-warning-accent/30',
};

// A tuple, not a mapped array: the fixed length is what makes `availableDates[0]` a definite string
// for `selectedDate`'s initial value.
const availableDates: [string, string, string] = [buildIsoDate(0), buildIsoDate(1), buildIsoDate(2)];

const MOCK_PROFESSIONALS: ProfessionalProfile[] = [
  {
    id: 'PROF-001',
    name: 'Efua Lamptey',
    role: 'NURSE',
    teamId: 'TEAM_BLUE',
    primaryZone: 'Accra Central',
    coverageZones: ['Accra Central', 'Labone'],
    availability: availableDates.map(date => ({ date, start: '07:00', end: '17:00' })),
  },
  {
    id: 'PROF-002',
    name: 'Dr. Kojo Bediako',
    role: 'DOCTOR',
    teamId: 'TEAM_BLUE',
    primaryZone: 'Accra Central',
    coverageZones: ['Accra Central', 'Osu'],
    availability: availableDates.map(date => ({ date, start: '08:00', end: '16:00' })),
  },
  {
    id: 'PROF-003',
    name: 'Kofi Agyeman',
    role: 'PHYSIOTHERAPIST',
    teamId: 'TEAM_BLUE',
    primaryZone: 'Accra Central',
    coverageZones: ['Accra Central', 'Osu'],
    availability: availableDates.map(date => ({ date, start: '09:00', end: '17:00' })),
  },
  {
    id: 'PROF-004',
    name: 'Abena Mensah',
    role: 'NURSE',
    teamId: 'TEAM_GOLD',
    primaryZone: 'Labone',
    coverageZones: ['Labone', 'Osu'],
    availability: availableDates.map(date => ({ date, start: '07:00', end: '15:00' })),
  },
];

const MOCK_PATIENTS: PatientProfile[] = [
  {
    id: 'PAT-001',
    name: 'Nana Kwa Otu',
    age: 68,
    ward: 'Cardiac Stepdown',
    zone: 'Accra Central',
    teamId: 'TEAM_BLUE',
    careLevel: 'Post-operative monitoring',
    focusAreas: ['Medication adherence', 'Blood pressure', 'Mobility support'],
    alerts: ['Fall risk', 'Low sodium diet'],
  },
  {
    id: 'PAT-002',
    name: 'Kwame Ofori',
    age: 54,
    ward: 'Neurology',
    zone: 'Accra Central',
    teamId: 'TEAM_BLUE',
    careLevel: 'Routine monitoring',
    focusAreas: ['Neuro checks', 'Hydration'],
    alerts: [],
  },
  {
    id: 'PAT-003',
    name: 'Esi Boateng',
    age: 44,
    ward: 'Orthopedics',
    zone: 'Accra Central',
    teamId: 'TEAM_BLUE',
    careLevel: 'Recovery',
    focusAreas: ['Physiotherapy', 'Pain management'],
    alerts: ['Post-surgery'],
  },
  {
    id: 'PAT-004',
    name: 'Ama Serwaa',
    age: 72,
    ward: 'Cardiology',
    zone: 'Accra Central',
    teamId: 'TEAM_BLUE',
    careLevel: 'Intensive monitoring',
    focusAreas: ['Heart rhythm', 'Fluid balance'],
    alerts: ['Pacemaker', 'Diuretic therapy'],
  },
];

function buildMockVisits(): ServiceVisit[] {
  const today = buildIsoDate(0);
  return [
    {
      id: 'VIS-001',
      patientId: 'PAT-001',
      date: today,
      title: 'Morning medication round',
      start: '07:30',
      end: '08:15',
      durationMinutes: 45,
      requiredRole: 'NURSE',
      zone: 'Accra Central',
      teamId: 'TEAM_BLUE',
      priority: 'CRITICAL',
      notes: 'Confirm anticoagulant dosage and hydration prompts.',
      assignmentStatus: 'UNASSIGNED',
      assignmentReason: 'Awaiting auto-scheduling.',
    },
    {
      id: 'VIS-002',
      patientId: 'PAT-001',
      date: today,
      title: 'Consultant ward round',
      start: '09:00',
      end: '09:45',
      durationMinutes: 45,
      requiredRole: 'DOCTOR',
      zone: 'Accra Central',
      teamId: 'TEAM_BLUE',
      priority: 'CRITICAL',
      notes: 'Review overnight ECG and adjust medication plan.',
      assignmentStatus: 'UNASSIGNED',
      assignmentReason: 'Awaiting auto-scheduling.',
    },
    {
      id: 'VIS-003',
      patientId: 'PAT-001',
      date: today,
      title: 'Physiotherapy session',
      start: '10:00',
      end: '10:30',
      durationMinutes: 30,
      requiredRole: 'PHYSIOTHERAPIST',
      zone: 'Accra Central',
      teamId: 'TEAM_BLUE',
      priority: 'CRITICAL',
      notes: 'Passive range of motion exercises.',
      assignmentStatus: 'UNASSIGNED',
      assignmentReason: 'Awaiting auto-scheduling.',
    },
    {
      id: 'VIS-004',
      patientId: 'PAT-001',
      date: today,
      title: 'Afternoon nursing check',
      start: '14:00',
      end: '14:30',
      durationMinutes: 30,
      requiredRole: 'NURSE',
      zone: 'Accra Central',
      teamId: 'TEAM_BLUE',
      priority: 'STANDARD',
      notes: 'Vital signs and wound dressing.',
      assignmentStatus: 'UNASSIGNED',
      assignmentReason: 'Awaiting auto-scheduling.',
    },
    {
      id: 'VIS-005',
      patientId: 'PAT-002',
      date: today,
      title: 'Morning neuro assessment',
      start: '08:30',
      end: '09:15',
      durationMinutes: 45,
      requiredRole: 'NURSE',
      zone: 'Accra Central',
      teamId: 'TEAM_BLUE',
      priority: 'STANDARD',
      notes: 'Pupil response and grip strength baseline.',
      assignmentStatus: 'UNASSIGNED',
      assignmentReason: 'Awaiting auto-scheduling.',
    },
    {
      id: 'VIS-006',
      patientId: 'PAT-002',
      date: today,
      title: 'Doctor review',
      start: '11:00',
      end: '11:30',
      durationMinutes: 30,
      requiredRole: 'DOCTOR',
      zone: 'Accra Central',
      teamId: 'TEAM_BLUE',
      priority: 'STANDARD',
      notes: 'Review MRI results.',
      assignmentStatus: 'UNASSIGNED',
      assignmentReason: 'Awaiting auto-scheduling.',
    },
    {
      id: 'VIS-007',
      patientId: 'PAT-003',
      date: today,
      title: 'Physiotherapy rehabilitation',
      start: '14:30',
      end: '15:15',
      durationMinutes: 45,
      requiredRole: 'PHYSIOTHERAPIST',
      zone: 'Accra Central',
      teamId: 'TEAM_BLUE',
      priority: 'ROUTINE',
      notes: 'Post-surgery gait training.',
      assignmentStatus: 'UNASSIGNED',
      assignmentReason: 'Awaiting auto-scheduling.',
    },
    {
      id: 'VIS-008',
      patientId: 'PAT-004',
      date: today,
      title: 'Cardiac monitoring round',
      start: '10:45',
      end: '11:15',
      durationMinutes: 30,
      requiredRole: 'NURSE',
      zone: 'Accra Central',
      teamId: 'TEAM_BLUE',
      priority: 'CRITICAL',
      notes: 'Record pacemaker readings and fluid intake.',
      assignmentStatus: 'UNASSIGNED',
      assignmentReason: 'Awaiting auto-scheduling.',
    },
    {
      id: 'VIS-009',
      patientId: 'PAT-004',
      date: today,
      title: 'Social care assessment',
      start: '15:00',
      end: '15:30',
      durationMinutes: 30,
      requiredRole: 'SOCIAL_WORKER',
      zone: 'Accra Central',
      teamId: 'TEAM_BLUE',
      priority: 'ROUTINE',
      notes: 'Discharge planning and family support coordination.',
      assignmentStatus: 'UNASSIGNED',
      assignmentReason: 'Awaiting auto-scheduling.',
    },
  ];
}

function buildIsoDate(offsetDays: number): string {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  value.setDate(value.getDate() + offsetDays);
  return value.toISOString().slice(0, 10);
}

function timeToMinutes(value: string): number {
  // Defaults cover a malformed value: without them a missing part yields NaN, which then silently
  // poisons every comparison that uses this.
  const [hours = 0, minutes = 0] = value.split(':').map(Number);
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
  imports: [FormsModule],
  templateUrl: './duty-roster.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DutyRosterComponent implements OnInit {
  readonly patients = signal<PatientProfile[]>([]);
  readonly professionals = signal<ProfessionalProfile[]>([]);
  readonly dates = availableDates;
  readonly selectedPatientId = signal<string | null>(null);
  readonly selectedDate = signal(this.dates[0]);
  readonly visits = signal<ServiceVisit[]>([]);
  readonly lastRunSummary = signal<SchedulingRunSummary | null>(null);

  readonly selectedPatient = computed(() => this.patients().find(patient => patient.id === this.selectedPatientId()) ?? this.patients()[0]);
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
    if (!patient) {
      return [];
    }

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
    this.patients.set(MOCK_PATIENTS);
    this.professionals.set(MOCK_PROFESSIONALS);
    this.visits.set(buildMockVisits());
    this.selectedPatientId.set(MOCK_PATIENTS[0]!.id);
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
          professional.availability.some(slot => slot.date === visit.date && slot.start <= visit.start && slot.end >= visit.end),
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

      // Non-empty: the length check above returns early.
      const selectedProfessional = eligibleProfessionals[0]!.professional;

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
