import dayjs from 'dayjs/esm';

export interface IProfile {
  id: string;
  personId?: string | null;
  photoId?: string | null;
  contactId?: string | null;
  addressList?: string | null;
  roles?: string | null;
  status?: boolean | null;
  organisationId?: string | null;
  teamId?: string | null;
  documentItems?: string | null;
  createdBy?: string | null;
  createdDate?: dayjs.Dayjs | null;
  modifiedBy?: string | null;
  modifiedDate?: dayjs.Dayjs | null;
}

export type NewProfile = Omit<IProfile, 'id'> & { id: null };
