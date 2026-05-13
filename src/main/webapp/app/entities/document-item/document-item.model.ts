import dayjs from 'dayjs/esm';
import { DocumentType } from 'app/entities/enumerations/document-type.model';

export interface IDocumentItem {
  id: string;
  name?: string | null;
  description?: string | null;
  documentType?: keyof typeof DocumentType | null;
  url?: string | null;
  createdDate?: dayjs.Dayjs | null;
  createdBy?: string | null;
  modifiedDate?: dayjs.Dayjs | null;
  modifiedBy?: string | null;
}

export type NewDocumentItem = Omit<IDocumentItem, 'id'> & { id: null };
