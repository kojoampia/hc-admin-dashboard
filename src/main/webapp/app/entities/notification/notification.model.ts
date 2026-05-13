import dayjs from 'dayjs/esm';

export interface INotification {
  id: string;
  content?: string | null;
  recipientId?: string | null;
  senderId?: string | null;
  messageType?: string | null;
  createdDate?: dayjs.Dayjs | null;
  modifiedDate?: dayjs.Dayjs | null;
}

export type NewNotification = Omit<INotification, 'id'> & { id: null };
