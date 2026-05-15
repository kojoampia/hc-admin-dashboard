export interface IDashboard {
  id: string;
  name?: string | null;
  description?: string | null;
  elements?: string | null;
}

export type NewDashboard = Omit<IDashboard, 'id'> & { id: null };
