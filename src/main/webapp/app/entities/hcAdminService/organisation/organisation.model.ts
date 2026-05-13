import dayjs from 'dayjs/esm';

export interface IOrganisation {
  id: string;
  name?: string | null;
  description?: string | null;
  profile?: string | null;
  createdDate?: dayjs.Dayjs | null;
  createdBy?: string | null;
  modifiedDate?: dayjs.Dayjs | null;
  modifiedBy?: string | null;
}

export type NewOrganisation = Omit<IOrganisation, 'id'> & { id: null };
