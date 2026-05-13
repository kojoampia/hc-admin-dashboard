export interface IFacilityCatalog {
  id: string;
  name?: string | null;
  description?: string | null;
  facilities?: string | null;
}

export type NewFacilityCatalog = Omit<IFacilityCatalog, 'id'> & { id: null };
