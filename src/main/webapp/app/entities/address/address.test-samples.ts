import dayjs from 'dayjs/esm';

import { IAddress, NewAddress } from './address.model';

export const sampleWithRequiredData: IAddress = {
  id: '1765b58b-0341-4b86-84d0-7a3416c09633',
  street: 'Middle Street',
  district: 'ownership pace',
  city: 'New Elvie',
  region: 'into with',
  code: 'present bony',
  country: 'Aland Islands',
  createdDate: dayjs('2026-05-12T12:38'),
  modifiedDate: dayjs('2026-05-12T18:16'),
};

export const sampleWithPartialData: IAddress = {
  id: '89a1ac1b-9bd5-4371-8e50-02ed8cebb784',
  street: 'Conn Courts',
  district: 'generally nautical structure',
  town: 'up yuck defiantly',
  city: 'Angelitaworth',
  region: 'demob although',
  code: 'peony bashfully marathon',
  country: 'Antarctica',
  createdDate: dayjs('2026-05-12T00:04'),
  modifiedDate: dayjs('2026-05-12T20:07'),
};

export const sampleWithFullData: IAddress = {
  id: '8924d93a-c664-4222-a9fd-a7bcd925bafb',
  street: 'Swaniawski Tunnel',
  district: 'against whereas',
  town: 'as',
  city: 'Fort Floyd',
  region: 'while',
  code: 'meh if',
  country: 'Uzbekistan',
  createdDate: dayjs('2026-05-12T00:47'),
  modifiedDate: dayjs('2026-05-12T02:08'),
};

export const sampleWithNewData: NewAddress = {
  street: 'Birch Avenue',
  district: 'over',
  city: 'South Xavierbury',
  region: 'pitiful weakly spiteful',
  code: 'kettledrum typeface',
  country: 'Tunisia',
  createdDate: dayjs('2026-05-12T12:07'),
  modifiedDate: dayjs('2026-05-12T09:21'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
