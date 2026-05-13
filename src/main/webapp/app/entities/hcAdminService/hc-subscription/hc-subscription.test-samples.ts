import dayjs from 'dayjs/esm';

import { IHCSubscription, NewHCSubscription } from './hc-subscription.model';

export const sampleWithRequiredData: IHCSubscription = {
  id: 'f1459253-a25d-4461-b245-305a96f16ea1',
};

export const sampleWithPartialData: IHCSubscription = {
  id: '59e0ab33-4531-47ee-b0eb-ba52d27f6977',
  isActive: true,
  createdDate: dayjs('2024-03-26T20:55'),
  modifiedBy: 'flat duh',
};

export const sampleWithFullData: IHCSubscription = {
  id: 'd4a43415-17a7-469e-ab3c-04af2eeca20a',
  serviceId: 'ugh',
  patientId: 'victorious',
  isActive: false,
  createdDate: dayjs('2024-03-26T06:15'),
  modifiedDate: dayjs('2024-03-26T08:24'),
  createdBy: 'drat',
  modifiedBy: 'dead dependable',
};

export const sampleWithNewData: NewHCSubscription = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
