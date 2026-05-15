import dayjs from 'dayjs/esm';
import { MessageType } from 'app/entities/enumerations/message-type.model';

export interface IMessage {
  id: string;
  content?: string | null;
  timestamp?: dayjs.Dayjs | null;
  senderId?: string | null;
  recipients?: string | null;
  type?: keyof typeof MessageType | null;
}

export type NewMessage = Omit<IMessage, 'id'> & { id: null };
