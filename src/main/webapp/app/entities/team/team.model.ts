import dayjs from 'dayjs/esm';

export interface ITeam {
  id: string;
  name?: string | null;
  description?: string | null;
  members?: string | null;
  supervisorId?: string | null;
  organisationId?: string | null;
  createdBy?: string | null;
  createdDate?: dayjs.Dayjs | null;
  modifiedBy?: string | null;
  modifiedDate?: dayjs.Dayjs | null;
}

export type NewTeam = Omit<ITeam, 'id'> & { id: null };
