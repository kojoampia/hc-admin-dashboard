import dayjs from 'dayjs/esm';

import { IProfessional, NewProfessional } from './professional.model';

export const sampleWithRequiredData: IProfessional = {
  id: '72aa3c17-bf53-46c0-9e51-9e2b65b8b6e2',
};

export const sampleWithPartialData: IProfessional = {
  id: 'bfe190b3-b090-4116-9e0f-3c9673b814a7',
  profile: 'for mid',
  createdDate: dayjs('2024-04-01'),
  createdBy: 'account taxicab',
  modifiedDate: dayjs('2024-04-02'),
  modifiedBy: 'swear translation',
};

export const sampleWithFullData: IProfessional = {
  id: '3f88b707-4dfa-40c0-83ea-4fa25e379b3c',
  name: 'enthusiastically nippy',
  organisation: 'concerning versus nucleotidase',
  roster: 'midst welcome passport',
  profile: 'zen to',
  createdDate: dayjs('2024-04-01'),
  createdBy: 'extract vacantly',
  modifiedDate: dayjs('2024-04-01'),
  modifiedBy: 'mobility despite',
};

export const sampleWithNewData: NewProfessional = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
