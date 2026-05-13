import dayjs from 'dayjs/esm';

import { IHCService, NewHCService } from './hc-service.model';

export const sampleWithRequiredData: IHCService = {
  id: '9cc8ada3-8de2-483a-bd19-50166ab42a4d',
};

export const sampleWithPartialData: IHCService = {
  id: '58e3c32c-c257-4d30-86de-2a4c375f55ab',
  description: 'mesh',
  serviceItems: 'excluding',
  createdDate: dayjs('2024-03-26'),
  createdBy: 'fax',
  modifiedDate: dayjs('2024-03-26'),
};

export const sampleWithFullData: IHCService = {
  id: '9197b614-d7da-4aba-ae03-5b7c6401e1d5',
  name: 'since bran yippee',
  description: 'yahoo',
  serviceItems: 'very',
  amount: 16721.27,
  createdDate: dayjs('2024-03-26'),
  createdBy: 'whenever kowtow dandelion',
  modifiedDate: dayjs('2024-03-26'),
  modifiedBy: 'memorise dead the',
};

export const sampleWithNewData: NewHCService = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
