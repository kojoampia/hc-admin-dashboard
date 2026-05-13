import dayjs from 'dayjs/esm';
import { FacilityType } from 'app/entities/enumerations/facility-type.model';

export interface IFacility {
  id: string;
  name?: string | null;
  description?: string | null;
  type?: keyof typeof FacilityType | null;
  addressId?: string | null;
  contactId?: string | null;
  photos?: string | null;
  createdBy?: string | null;
  createdDate?: dayjs.Dayjs | null;
  modifiedBy?: string | null;
  modifiedDate?: dayjs.Dayjs | null;
}

export type NewFacility = Omit<IFacility, 'id'> & { id: null };
