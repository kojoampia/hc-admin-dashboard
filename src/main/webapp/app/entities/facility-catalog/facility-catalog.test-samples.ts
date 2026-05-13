import { IFacilityCatalog, NewFacilityCatalog } from './facility-catalog.model';

export const sampleWithRequiredData: IFacilityCatalog = {
  id: 'dd99cb15-b25a-45dd-9259-7326e527021b',
  name: 'meager',
  description: 'beneath with',
  facilities: 'blah',
};

export const sampleWithPartialData: IFacilityCatalog = {
  id: 'd824d32e-650a-4783-bcb7-3c058b82c7ba',
  name: 'putrefy fiercely',
  description: 'oof who quiet',
  facilities: 'barring',
};

export const sampleWithFullData: IFacilityCatalog = {
  id: 'ef179529-c0c9-4523-aca6-1398219943c5',
  name: 'greedily',
  description: 'to',
  facilities: 'famously now unbearably',
};

export const sampleWithNewData: NewFacilityCatalog = {
  name: 'webbed strong scar',
  description: 'meager stark ha',
  facilities: 'deduce',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
