import dayjs from 'dayjs/esm';

import { IHProfessional, NewHProfessional } from './h-professional.model';

export const sampleWithRequiredData: IHProfessional = {
  id: '0ed1255d-911f-4134-844a-5a2c72e4638b',
};

export const sampleWithPartialData: IHProfessional = {
  id: '0344de0b-5660-4ee9-a0e3-7515472c183c',
  name: 'scout drat',
  modifiedDate: dayjs('2024-04-02'),
  modifiedBy: 'meanwhile',
  profile: 'sediment bah',
};

export const sampleWithFullData: IHProfessional = {
  id: '5e38039e-0fb5-42ef-beb2-1a050054ed33',
  name: 'stage within',
  organisation: 'yahoo',
  roster: 'probable spring but',
  createdDate: dayjs('2024-04-01'),
  createdBy: 'hydrocarbon buck boohoo',
  modifiedDate: dayjs('2024-04-01'),
  modifiedBy: 'excluding',
  profile: 'deceivingly',
};

export const sampleWithNewData: NewHProfessional = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
