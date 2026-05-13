import dayjs from 'dayjs/esm';
import { CatalogType } from 'app/entities/enumerations/catalog-type.model';

export interface ISystemCatalog {
  id: string;
  name?: string | null;
  description?: string | null;
  type?: keyof typeof CatalogType | null;
  content?: string | null;
  createdDate?: dayjs.Dayjs | null;
  modifiedDate?: dayjs.Dayjs | null;
  createdBy?: string | null;
  modifiedBy?: string | null;
}

export type NewSystemCatalog = Omit<ISystemCatalog, 'id'> & { id: null };
