import { IDashboard, NewDashboard } from './dashboard.model';

export const sampleWithRequiredData: IDashboard = {
  id: 'ede9124b-f3a0-47c0-93e8-c9fd1b11c158',
};

export const sampleWithPartialData: IDashboard = {
  id: '499c0104-8a12-4710-b42d-b083052acbf8',
  description: 'huge anenst lightly',
  elements: 'overconfidently',
};

export const sampleWithFullData: IDashboard = {
  id: '7c31349d-fd28-4f5a-8537-2139cb8dd1c4',
  name: 'but flu',
  description: 'pleasing',
  elements: 'authorized mid but',
};

export const sampleWithNewData: NewDashboard = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
