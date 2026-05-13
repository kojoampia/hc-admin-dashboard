import dayjs from 'dayjs/esm';

import { IProfile, NewProfile } from './profile.model';

export const sampleWithRequiredData: IProfile = {
  id: '93b3b7f0-e241-48b2-be0d-5215a59c1f97',
  personId: 'cuddly like',
  photoId: 'behind cleverly why',
  contactId: 'tidy highly',
  addressList: 'vast merry',
  status: true,
  organisationId: 'er',
  teamId: 'if fooey apropos',
  documentItems: 'spanish',
  createdBy: 'corral',
  createdDate: dayjs('2026-05-12T16:52'),
  modifiedBy: 'fabricate management',
  modifiedDate: dayjs('2026-05-12T19:26'),
};

export const sampleWithPartialData: IProfile = {
  id: '0bd9e18c-9d32-4d0c-8441-f93e6a7a3c62',
  personId: 'amongst',
  photoId: 'um',
  contactId: 'phooey fervently',
  addressList: 'reconsideration weakly',
  roles: 'pish',
  status: true,
  organisationId: 'modulo',
  teamId: 'throughout account',
  documentItems: 'consequently deceivingly',
  createdBy: 'attest',
  createdDate: dayjs('2026-05-12T04:48'),
  modifiedBy: 'gown midst',
  modifiedDate: dayjs('2026-05-12T13:20'),
};

export const sampleWithFullData: IProfile = {
  id: 'e4528582-c76e-41ab-bab6-3b2ccd139d88',
  personId: 'cavernous inure powerfully',
  photoId: 'how excepting',
  contactId: 'gee',
  addressList: 'equally',
  roles: 'skyscraper spear yahoo',
  status: true,
  organisationId: 'that',
  teamId: 'now overvalue nocturnal',
  documentItems: 'perfectly but',
  createdBy: 'between electrify',
  createdDate: dayjs('2026-05-12T11:34'),
  modifiedBy: 'furthermore aw apud',
  modifiedDate: dayjs('2026-05-12T14:00'),
};

export const sampleWithNewData: NewProfile = {
  personId: 'who abaft of',
  photoId: 'thin heavily',
  contactId: 'gripper neatly beside',
  addressList: 'boo',
  status: false,
  organisationId: 'accurate opposite',
  teamId: 'trusty uh-huh readmit',
  documentItems: 'yum',
  createdBy: 'saturate',
  createdDate: dayjs('2026-05-12T15:37'),
  modifiedBy: 'leap invite boohoo',
  modifiedDate: dayjs('2026-05-12T16:56'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
