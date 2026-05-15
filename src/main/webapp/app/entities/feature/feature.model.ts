import { FeatureType } from 'app/entities/enumerations/feature-type.model';

export interface IFeature {
  id: string;
  name?: string | null;
  description?: string | null;
  type?: keyof typeof FeatureType | null;
}

export type NewFeature = Omit<IFeature, 'id'> & { id: null };
