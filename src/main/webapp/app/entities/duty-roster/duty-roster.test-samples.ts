import dayjs from 'dayjs/esm';

import { IDutyRoster, NewDutyRoster } from './duty-roster.model';

export const sampleWithRequiredData: IDutyRoster = {
  id: 'ec8cc14a-1b2e-4b05-84e8-7f7313d521f7',
  date: dayjs('2026-05-12'),
  duty: 'DOCTOR',
  professionalId: 'hasty',
  shift: 'NIGHT',
  name: 'sniveling',
  patientId: 'er wherever oof',
};

export const sampleWithPartialData: IDutyRoster = {
  id: '9eb693f4-8a36-4d37-9cf5-db29b638b205',
  date: dayjs('2026-05-12'),
  duty: 'ADMINISTRATOR',
  professionalId: 'rosemary penalise rear',
  shift: 'NIGHT',
  name: 'faraway uselessly brr',
  patientId: 'harangue',
};

export const sampleWithFullData: IDutyRoster = {
  id: 'b72beefc-1b56-4725-bea8-e094161192df',
  date: dayjs('2026-05-11'),
  duty: 'CARE',
  professionalId: 'conservation rough',
  shift: 'AFTERNOON',
  name: 'through',
  description: 'although plump consequently',
  patientId: 'bah besides treble',
};

export const sampleWithNewData: NewDutyRoster = {
  date: dayjs('2026-05-12'),
  duty: 'VENDOR',
  professionalId: 'like properly',
  shift: 'AFTERNOON',
  name: 'across aside upsell',
  patientId: 'greedy avaricious',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
