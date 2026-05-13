import dayjs from 'dayjs/esm';

import { INotification, NewNotification } from './notification.model';

export const sampleWithRequiredData: INotification = {
  id: '4917d9fb-b873-41d6-981d-153319417462',
  content: 'instantly yum',
  recipientId: 'yuck reopen gaseous',
  senderId: 'equally absent which',
  messageType: 'notwithstanding',
};

export const sampleWithPartialData: INotification = {
  id: '0901a96b-6612-4703-9cb4-90129d6818ca',
  content: 'dress mystify once',
  recipientId: 'resort grandpa',
  senderId: 'reassemble nor windy',
  messageType: 'next as ouch',
};

export const sampleWithFullData: INotification = {
  id: '27befbee-c69c-445f-a315-e759c182bfa5',
  content: 'gust',
  recipientId: 'opposite brand',
  senderId: 'illusion meh phooey',
  messageType: 'painfully far serpentine',
  createdDate: dayjs('2026-05-12T06:58'),
  modifiedDate: dayjs('2026-05-12T08:16'),
};

export const sampleWithNewData: NewNotification = {
  content: 'consequently voluntarily ew',
  recipientId: 'honesty depart acquaintance',
  senderId: 'aw save yuck',
  messageType: 'when',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
