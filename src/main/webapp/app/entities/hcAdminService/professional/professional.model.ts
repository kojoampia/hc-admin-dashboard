import dayjs from 'dayjs/esm';

export interface IProfessional {
  id: string;
  name?: string | null;
  organisation?: string | null;
  roster?: string | null;
  profile?: string | null;
  createdDate?: dayjs.Dayjs | null;
  createdBy?: string | null;
  modifiedDate?: dayjs.Dayjs | null;
  modifiedBy?: string | null;
}

export type NewProfessional = Omit<IProfessional, 'id'> & { id: null };
