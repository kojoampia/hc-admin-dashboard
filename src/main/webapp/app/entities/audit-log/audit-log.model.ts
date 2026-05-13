import dayjs from 'dayjs/esm';

export interface IAuditLog {
  id: string;
  actionType?: string | null;
  userId?: string | null;
  metadata?: string | null;
  createdBy?: string | null;
  createdDate?: dayjs.Dayjs | null;
  modifiedBy?: string | null;
  modifiedDate?: dayjs.Dayjs | null;
}

export type NewAuditLog = Omit<IAuditLog, 'id'> & { id: null };
