import dayjs from 'dayjs/esm';

export interface IOrganisation {
  id: string;
  name?: string | null;
  description?: string | null;
  addressId?: string | null;
  contactId?: string | null;
  createdBy?: string | null;
  createdDate?: dayjs.Dayjs | null;
  modifiedBy?: string | null;
  modifiedDate?: dayjs.Dayjs | null;
}

export type NewOrganisation = Omit<IOrganisation, 'id'> & { id: null };
