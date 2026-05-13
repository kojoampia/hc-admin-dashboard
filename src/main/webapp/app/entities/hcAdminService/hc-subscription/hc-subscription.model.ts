import dayjs from 'dayjs/esm';

export interface IHCSubscription {
  id: string;
  serviceId?: string | null;
  patientId?: string | null;
  isActive?: boolean | null;
  createdDate?: dayjs.Dayjs | null;
  modifiedDate?: dayjs.Dayjs | null;
  createdBy?: string | null;
  modifiedBy?: string | null;
}

export type NewHCSubscription = Omit<IHCSubscription, 'id'> & { id: null };
