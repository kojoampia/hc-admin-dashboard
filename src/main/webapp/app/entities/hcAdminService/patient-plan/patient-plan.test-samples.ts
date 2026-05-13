import dayjs from 'dayjs/esm';

import { IPatientPlan, NewPatientPlan } from './patient-plan.model';

export const sampleWithRequiredData: IPatientPlan = {
  id: '475bf9fc-5a3a-42cc-aaba-721d94c78de8',
  planId: 'during anesthetize when',
  patientId: 'whose knitting',
  startDate: dayjs('2026-05-12'),
  endDate: dayjs('2026-05-12'),
  createdDate: dayjs('2026-05-12T02:14'),
  createdBy: 'awkwardly',
};

export const sampleWithPartialData: IPatientPlan = {
  id: 'dcb0b167-c656-4a02-a0df-143ba279c25d',
  planId: 'for',
  patientId: 'meh',
  startDate: dayjs('2026-05-11'),
  endDate: dayjs('2026-05-12'),
  createdDate: dayjs('2026-05-12T02:57'),
  createdBy: 'ack who',
};

export const sampleWithFullData: IPatientPlan = {
  id: '031b1343-18cc-48a1-bc75-30c16cb138bb',
  planId: 'instructor',
  patientId: 'achieve shipper',
  startDate: dayjs('2026-05-12'),
  endDate: dayjs('2026-05-12'),
  createdDate: dayjs('2026-05-12T07:05'),
  createdBy: 'sanity quixotic broadly',
};

export const sampleWithNewData: NewPatientPlan = {
  planId: 'printer but',
  patientId: 'faithfully',
  startDate: dayjs('2026-05-12'),
  endDate: dayjs('2026-05-12'),
  createdDate: dayjs('2026-05-12T06:05'),
  createdBy: 'however stack thread',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
