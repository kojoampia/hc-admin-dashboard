import dayjs from 'dayjs/esm';

export interface IHProfessional {
  id: string;
  name?: string | null;
  organisation?: string | null;
  roster?: string | null;
  createdDate?: dayjs.Dayjs | null;
  createdBy?: string | null;
  modifiedDate?: dayjs.Dayjs | null;
  modifiedBy?: string | null;
  profile?: string | null;
}

export type NewHProfessional = Omit<IHProfessional, 'id'> & { id: null };
