import dayjs from 'dayjs/esm';

export interface IHCService {
  id: string;
  name?: string | null;
  description?: string | null;
  serviceItems?: string | null;
  amount?: number | null;
  createdDate?: dayjs.Dayjs | null;
  createdBy?: string | null;
  modifiedDate?: dayjs.Dayjs | null;
  modifiedBy?: string | null;
}

export type NewHCService = Omit<IHCService, 'id'> & { id: null };
