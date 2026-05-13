import dayjs from 'dayjs/esm';

import { ITeam, NewTeam } from './team.model';

export const sampleWithRequiredData: ITeam = {
  id: 'f669f9ce-8faf-40b2-bd92-59c77342ae68',
  name: 'frilly',
  description: 'gosh ew awkwardly',
  createdBy: 'snowplow now',
  createdDate: dayjs('2026-05-12T10:43'),
  modifiedBy: 'strong deliquesce',
  modifiedDate: dayjs('2026-05-12T21:42'),
};

export const sampleWithPartialData: ITeam = {
  id: 'caa8b969-d0fa-4dc0-975c-18c5e25089b2',
  name: 'sunbathe tackle',
  description: 'yippee for suddenly',
  members: 'deployment onto splash',
  supervisorId: 'scarcely knowledgeable',
  createdBy: 'stunt joyously cycle',
  createdDate: dayjs('2026-05-12T20:02'),
  modifiedBy: 'proliferate',
  modifiedDate: dayjs('2026-05-12T13:38'),
};

export const sampleWithFullData: ITeam = {
  id: '9b2e8d30-ed7e-4eee-9f9c-7afff9d63854',
  name: 'dead',
  description: 'or',
  members: 'for',
  supervisorId: 'aw suddenly',
  organisationId: 'better',
  createdBy: 'bore cheerfully goodwill',
  createdDate: dayjs('2026-05-12T19:10'),
  modifiedBy: 'descent electric basket',
  modifiedDate: dayjs('2026-05-12T12:31'),
};

export const sampleWithNewData: NewTeam = {
  name: 'unfreeze instructive waver',
  description: 'tune-up armchair cutlet',
  createdBy: 'er untimely convection',
  createdDate: dayjs('2026-05-12T19:50'),
  modifiedBy: 'waft',
  modifiedDate: dayjs('2026-05-12T19:41'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
