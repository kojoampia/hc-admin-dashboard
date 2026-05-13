import dayjs from 'dayjs/esm';

import { IPhoto, NewPhoto } from './photo.model';

export const sampleWithRequiredData: IPhoto = {
  id: '807ff811-b447-4416-8efe-91202399faae',
  description: 'joyously',
  url: 'https://ripe-pupil.name',
  profileId: 'consequently',
  photoType: 'REPORT_PHOTO',
  data: '../fake-data/blob/hipster.png',
  dataContentType: 'unknown',
  createdDate: dayjs('2026-05-12T12:04'),
  modifiedBy: 'joshingly into',
  modifiedDate: dayjs('2026-05-12T15:37'),
};

export const sampleWithPartialData: IPhoto = {
  id: '05103cc7-0517-4080-ab57-ee74dd703d25',
  description: 'unfurl blah next',
  altText: 'ew',
  url: 'https://insistent-backburn.com',
  profileId: 'bathhouse or',
  photoType: 'PORTRAIT',
  data: '../fake-data/blob/hipster.png',
  dataContentType: 'unknown',
  createdBy: 'because ouch inquisitively',
  createdDate: dayjs('2026-05-12T07:55'),
  modifiedBy: 'rapid indeed',
  modifiedDate: dayjs('2026-05-11T23:51'),
};

export const sampleWithFullData: IPhoto = {
  id: 'c5c3a612-c239-44ef-904b-c41a5a4f475a',
  description: 'yuck',
  altText: 'sin loyally',
  url: 'https://helpless-custom.info/',
  profileId: 'home honorable painfully',
  photoType: 'DOCUMENT_PHOTO',
  data: '../fake-data/blob/hipster.png',
  dataContentType: 'unknown',
  photoMetadata: 'attribute far',
  createdBy: 'husk excepting',
  createdDate: dayjs('2026-05-12T04:20'),
  modifiedBy: 'after finally stained',
  modifiedDate: dayjs('2026-05-12T17:41'),
};

export const sampleWithNewData: NewPhoto = {
  description: 'huzzah',
  url: 'https://far-apparatus.com/',
  profileId: 'vet from unless',
  photoType: 'REPORT_PHOTO',
  data: '../fake-data/blob/hipster.png',
  dataContentType: 'unknown',
  createdDate: dayjs('2026-05-11T23:49'),
  modifiedBy: 'although phew',
  modifiedDate: dayjs('2026-05-12T02:12'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
