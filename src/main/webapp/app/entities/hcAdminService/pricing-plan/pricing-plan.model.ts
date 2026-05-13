import { BillingType } from 'app/entities/enumerations/billing-type.model';

export interface IPricingPlan {
  id: string;
  name?: string | null;
  description?: string | null;
  price?: number | null;
  features?: string | null;
  billingCycle?: keyof typeof BillingType | null;
  active?: boolean | null;
}

export type NewPricingPlan = Omit<IPricingPlan, 'id'> & { id: null };
