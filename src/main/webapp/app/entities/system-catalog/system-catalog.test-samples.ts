import dayjs from 'dayjs/esm';

import { ISystemCatalog, NewSystemCatalog } from './system-catalog.model';

export const sampleWithRequiredData: ISystemCatalog = {
  id: 'cbf86ad9-43aa-4123-a912-51e7ae10721b',
  name: 'rebuke bathrobe',
  description: 'entice among',
  type: 'PRODUCT',
  content: '../fake-data/blob/hipster.txt',
  createdDate: dayjs('2026-05-12T07:36'),
  modifiedDate: dayjs('2026-05-11T23:03'),
  createdBy: 'communicate',
  modifiedBy: 'wherever',
};

export const sampleWithPartialData: ISystemCatalog = {
  id: '9ad96617-32e6-454f-bddc-91ac62df44da',
  name: 'keenly puritan yippee',
  description: 'lift',
  type: 'PRODUCT',
  content: '../fake-data/blob/hipster.txt',
  createdDate: dayjs('2026-05-12T00:43'),
  modifiedDate: dayjs('2026-05-11T23:22'),
  createdBy: 'couch',
  modifiedBy: 'dishearten optimal truly',
};

export const sampleWithFullData: ISystemCatalog = {
  id: '4410fe11-8646-45e9-bd6f-104111e80eaf',
  name: 'chap',
  description: 'energetic perfumed',
  type: 'ABOUT',
  content: '../fake-data/blob/hipster.txt',
  createdDate: dayjs('2026-05-12T00:44'),
  modifiedDate: dayjs('2026-05-12T05:00'),
  createdBy: 'sonar gee',
  modifiedBy: 'upward',
};

export const sampleWithNewData: NewSystemCatalog = {
  name: 'rowdy towards',
  description: 'although',
  type: 'PRODUCT',
  content: '../fake-data/blob/hipster.txt',
  createdDate: dayjs('2026-05-12T06:03'),
  modifiedDate: dayjs('2026-05-11T23:15'),
  createdBy: 'instead',
  modifiedBy: 'ironclad',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
