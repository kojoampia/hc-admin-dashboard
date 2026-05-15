import dayjs from 'dayjs/esm';

export interface IPatientPlan {
  id: string;
  planId?: string | null;
  patientId?: string | null;
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  createdDate?: dayjs.Dayjs | null;
  createdBy?: string | null;
}

export type NewPatientPlan = Omit<IPatientPlan, 'id'> & { id: null };
