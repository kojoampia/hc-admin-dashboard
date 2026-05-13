import dayjs from 'dayjs/esm';
import { GenderType } from 'app/entities/enumerations/gender-type.model';
import { LanguageType } from 'app/entities/enumerations/language-type.model';

export interface IPerson {
  id: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  birthDate?: dayjs.Dayjs | null;
  gender?: keyof typeof GenderType | null;
  maritalStatus?: string | null;
  nationality?: string | null;
  language?: keyof typeof LanguageType | null;
  createdDate?: dayjs.Dayjs | null;
  modifiedDate?: dayjs.Dayjs | null;
  createdBy?: string | null;
  modifiedBy?: string | null;
}

export type NewPerson = Omit<IPerson, 'id'> & { id: null };
