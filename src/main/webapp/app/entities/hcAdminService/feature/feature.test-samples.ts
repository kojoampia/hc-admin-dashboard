import { IFeature, NewFeature } from './feature.model';

export const sampleWithRequiredData: IFeature = {
  id: 'c524ee60-f681-4c47-9f62-131de9338faf',
  type: 'CORE',
};

export const sampleWithPartialData: IFeature = {
  id: '9214ae80-8636-409a-a571-5bebba8f371d',
  name: 'memorise usefully aware',
  description: 'endow marvelous foolishly',
  type: 'CORE',
};

export const sampleWithFullData: IFeature = {
  id: 'f1588f8b-174c-4309-8b0a-8534844373a1',
  name: 'ick pomelo',
  description: 'than',
  type: 'ADDON',
};

export const sampleWithNewData: NewFeature = {
  type: 'CORE',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
