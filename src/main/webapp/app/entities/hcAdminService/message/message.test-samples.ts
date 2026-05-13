import dayjs from 'dayjs/esm';

import { IMessage, NewMessage } from './message.model';

export const sampleWithRequiredData: IMessage = {
  id: '42bfda03-0f8b-4ea3-a0e7-520813ec664a',
  content: 'anti huzzah',
  timestamp: dayjs('2026-05-12T14:57'),
  senderId: 'flawed um minus',
  recipients: 'spirited awesome',
  type: 'REMINDER',
};

export const sampleWithPartialData: IMessage = {
  id: '0e3af454-266b-4007-87fa-17e609fd9603',
  content: 'guard frantically',
  timestamp: dayjs('2026-05-11T17:26'),
  senderId: 'wilt stormy vol',
  recipients: 'loudly juicy into',
  type: 'NOTIFICATION',
};

export const sampleWithFullData: IMessage = {
  id: '1dbe3ed3-49c7-43ac-8029-cff4cc208105',
  content: 'versus zebra minus',
  timestamp: dayjs('2026-05-11T23:16'),
  senderId: 'hoof yahoo',
  recipients: 'uncork',
  type: 'REMINDER',
};

export const sampleWithNewData: NewMessage = {
  content: 'in punctually elegantly',
  timestamp: dayjs('2026-05-12T12:04'),
  senderId: 'uselessly',
  recipients: 'absentmindedly reach gosh',
  type: 'ALERT',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
