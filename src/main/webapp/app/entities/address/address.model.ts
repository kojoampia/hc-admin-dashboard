import dayjs from 'dayjs/esm';

export interface IAddress {
  id: string;
  street?: string | null;
  district?: string | null;
  town?: string | null;
  city?: string | null;
  region?: string | null;
  code?: string | null;
  country?: string | null;
  createdDate?: dayjs.Dayjs | null;
  modifiedDate?: dayjs.Dayjs | null;
}

export type NewAddress = Omit<IAddress, 'id'> & { id: null };
