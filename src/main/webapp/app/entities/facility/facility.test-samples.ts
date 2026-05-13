import dayjs from 'dayjs/esm';

import { IFacility, NewFacility } from './facility.model';

export const sampleWithRequiredData: IFacility = {
  id: 'dde8194c-510d-47e4-bfff-fd534b0364ec',
  name: 'optimistic',
  description: 'carelessly',
  type: 'LAB',
  addressId: 'yippee kindheartedly bran',
  contactId: 'consequently traduce gladly',
  createdDate: dayjs('2026-05-12T21:29'),
  modifiedBy: 'depart eek officially',
  modifiedDate: dayjs('2026-05-12T22:31'),
};

export const sampleWithPartialData: IFacility = {
  id: '06378d22-0bf7-4e78-bec3-5f6544c33235',
  name: 'puppet',
  description: 'sandy',
  type: 'OTHER',
  addressId: 'save',
  contactId: 'immense pish wearily',
  photos: 'unless questioningly',
  createdDate: dayjs('2026-05-12T00:55'),
  modifiedBy: 'spring',
  modifiedDate: dayjs('2026-05-12T03:29'),
};

export const sampleWithFullData: IFacility = {
  id: '23994669-4596-41fc-bb44-5c261be4f463',
  name: 'foot pish um',
  description: 'fibre vice',
  type: 'HOSPICE',
  addressId: 'terrorise indeed',
  contactId: 'among',
  photos: 'indeed or numeracy',
  createdBy: 'while',
  createdDate: dayjs('2026-05-12T20:11'),
  modifiedBy: 'neatly hence',
  modifiedDate: dayjs('2026-05-12T10:15'),
};

export const sampleWithNewData: NewFacility = {
  name: 'dimly rot',
  description: 'midwife',
  type: 'PHARMACY',
  addressId: 'drat consequently',
  contactId: 'crooked',
  createdDate: dayjs('2026-05-12T05:14'),
  modifiedBy: 'bakeware blah geez',
  modifiedDate: dayjs('2026-05-12T18:31'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
