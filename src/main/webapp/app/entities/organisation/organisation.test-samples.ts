import dayjs from 'dayjs/esm';

import { IOrganisation, NewOrganisation } from './organisation.model';

export const sampleWithRequiredData: IOrganisation = {
  id: '7a2100a0-377f-4e60-b904-54b581f865af',
  name: 'ouch',
  description: 'memorable meh',
  addressId: 'though',
  contactId: 'supposing idealistic card',
  createdBy: 'huzzah anenst unimpressively',
  createdDate: dayjs('2026-05-12T21:01'),
  modifiedBy: 'confound thin homeschool',
  modifiedDate: dayjs('2026-05-12T00:48'),
};

export const sampleWithPartialData: IOrganisation = {
  id: '827b2fbf-c032-4981-be81-29112201239d',
  name: 'joyous representation presell',
  description: 'shoddy amid yowza',
  addressId: 'once once',
  contactId: 'task',
  createdBy: 'around midst despite',
  createdDate: dayjs('2026-05-12T08:54'),
  modifiedBy: 'pile so',
  modifiedDate: dayjs('2026-05-12T11:18'),
};

export const sampleWithFullData: IOrganisation = {
  id: '126f2b88-1233-4be7-8036-3669e54075d0',
  name: 'tomorrow yet before',
  description: 'utterly until less',
  addressId: 'heavy so able',
  contactId: 'how saloon',
  createdBy: 'whether',
  createdDate: dayjs('2026-05-12T07:38'),
  modifiedBy: 'meh',
  modifiedDate: dayjs('2026-05-11T23:18'),
};

export const sampleWithNewData: NewOrganisation = {
  name: 'humble',
  description: 'boohoo finer',
  addressId: 'tall nearly',
  contactId: 'between',
  createdBy: 'given overload',
  createdDate: dayjs('2026-05-12T08:33'),
  modifiedBy: 'along',
  modifiedDate: dayjs('2026-05-12T15:51'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
