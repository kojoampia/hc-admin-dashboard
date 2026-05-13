import dayjs from 'dayjs/esm';
import { PhotoType } from 'app/entities/enumerations/photo-type.model';

export interface IPhoto {
  id: string;
  description?: string | null;
  altText?: string | null;
  url?: string | null;
  profileId?: string | null;
  photoType?: keyof typeof PhotoType | null;
  data?: string | null;
  dataContentType?: string | null;
  photoMetadata?: string | null;
  createdBy?: string | null;
  createdDate?: dayjs.Dayjs | null;
  modifiedBy?: string | null;
  modifiedDate?: dayjs.Dayjs | null;
}

export type NewPhoto = Omit<IPhoto, 'id'> & { id: null };
