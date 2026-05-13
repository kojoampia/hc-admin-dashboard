import dayjs from 'dayjs/esm';

import { IPerson, NewPerson } from './person.model';

export const sampleWithRequiredData: IPerson = {
  id: '2e43055c-d6c6-43e0-80f3-140627a0f737',
  firstName: 'Emmet',
  middleName: 'when',
  lastName: 'Windler',
  birthDate: dayjs('2026-05-12'),
  gender: 'FEMALE',
  maritalStatus: 'decision save per',
  nationality: 'deceivingly',
  language: 'EN',
  createdDate: dayjs('2026-05-12T10:39'),
  modifiedDate: dayjs('2026-05-12T04:42'),
  createdBy: 'abscond before sympathetically',
  modifiedBy: 'yippee aboard redound',
};

export const sampleWithPartialData: IPerson = {
  id: 'c839b949-c336-477d-88ad-d63b03e7dc52',
  firstName: 'Maegan',
  middleName: 'naturally of',
  lastName: 'Lubowitz',
  birthDate: dayjs('2026-05-12'),
  gender: 'FEMALE',
  maritalStatus: 'oof sophisticated',
  nationality: 'apud athwart',
  language: 'DAGBANI',
  createdDate: dayjs('2026-05-12T02:13'),
  modifiedDate: dayjs('2026-05-12T19:08'),
  createdBy: 'farmer absent woot',
  modifiedBy: 'summarise drain',
};

export const sampleWithFullData: IPerson = {
  id: 'bbbc82e5-092f-4133-95c3-2a196e5fb946',
  firstName: 'Diego',
  middleName: 'where firsthand usually',
  lastName: 'Batz',
  birthDate: dayjs('2026-05-11'),
  gender: 'FEMALE',
  maritalStatus: 'mealy',
  nationality: 'before numeracy',
  language: 'DAGBANI',
  createdDate: dayjs('2026-05-11T23:47'),
  modifiedDate: dayjs('2026-05-12T21:17'),
  createdBy: 'prestigious only',
  modifiedBy: 'bah nearly',
};

export const sampleWithNewData: NewPerson = {
  firstName: 'Lois',
  middleName: 'inside',
  lastName: 'Yundt',
  birthDate: dayjs('2026-05-12'),
  gender: 'MALE',
  maritalStatus: 'across pish violin',
  nationality: 'eke',
  language: 'ES',
  createdDate: dayjs('2026-05-12T14:01'),
  modifiedDate: dayjs('2026-05-12T10:23'),
  createdBy: 'mixed next anenst',
  modifiedBy: 'throughout often masticate',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
