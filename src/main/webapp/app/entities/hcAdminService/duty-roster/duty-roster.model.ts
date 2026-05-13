import dayjs from 'dayjs/esm';
import { DutyRole } from 'app/entities/enumerations/duty-role.model';
import { ShiftType } from 'app/entities/enumerations/shift-type.model';

export interface IDutyRoster {
  id: string;
  date?: dayjs.Dayjs | null;
  duty?: keyof typeof DutyRole | null;
  professionalId?: string | null;
  shift?: keyof typeof ShiftType | null;
  name?: string | null;
  description?: string | null;
  patientId?: string | null;
}

export type NewDutyRoster = Omit<IDutyRoster, 'id'> & { id: null };
