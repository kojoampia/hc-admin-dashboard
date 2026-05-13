export interface IContact {
  id: string;
  personId?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  countryCode?: number | null;
}

export type NewContact = Omit<IContact, 'id'> & { id: null };
