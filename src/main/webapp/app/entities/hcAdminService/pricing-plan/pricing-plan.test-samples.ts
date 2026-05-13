import { IPricingPlan, NewPricingPlan } from './pricing-plan.model';

export const sampleWithRequiredData: IPricingPlan = {
  id: 'e3234a40-92be-4d11-8367-4680384736fd',
  name: 'pressure trek',
  description: 'sedately stuff',
  price: 27653.56,
  features: 'governance pro',
  billingCycle: 'MONTHLY',
  active: true,
};

export const sampleWithPartialData: IPricingPlan = {
  id: 'a4ae56d4-b73b-4675-8777-b541c9cf1fc4',
  name: 'criminal apud citizen',
  description: 'powerfully',
  price: 15467.27,
  features: 'sometimes oh',
  billingCycle: 'QUARTERLY',
  active: false,
};

export const sampleWithFullData: IPricingPlan = {
  id: 'f09e4f26-daf8-4454-a572-70a78c06039b',
  name: 'impractical',
  description: 'ugly netsuke low',
  price: 5287.52,
  features: 'unrealistic provided than',
  billingCycle: 'MONTHLY',
  active: true,
};

export const sampleWithNewData: NewPricingPlan = {
  name: 'fatally major whoa',
  description: 'yuck assail nor',
  price: 8775.37,
  features: 'hm',
  billingCycle: 'MONTHLY',
  active: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
