import dayjs from 'dayjs/esm';

import { IOrganisation, NewOrganisation } from './organisation.model';

export const sampleWithRequiredData: IOrganisation = {
  id: '7a2100a0-377f-4e60-b904-54b581f865af',
};

export const sampleWithPartialData: IOrganisation = {
  id: 'fc032981-e812-4911-a220-1239ded984f6',
  description: 'representation presell',
  profile: 'shoddy amid yowza',
  createdBy: 'once once',
};

export const sampleWithFullData: IOrganisation = {
  id: '126f2b88-1233-4be7-8036-3669e54075d0',
  name: 'tomorrow yet before',
  description: 'utterly until less',
  profile: 'heavy so able',
  createdDate: dayjs('2024-04-01'),
  createdBy: 'unlike design',
  modifiedDate: dayjs('2024-04-01'),
  modifiedBy: 'highly meh boohoo',
};

export const sampleWithNewData: NewOrganisation = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
