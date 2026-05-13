import dayjs from 'dayjs/esm';

import { IAuditLog, NewAuditLog } from './audit-log.model';

export const sampleWithRequiredData: IAuditLog = {
  id: 'b6cf7b9c-c00f-45a2-8438-7ace097d2777',
  actionType: 'amid',
  userId: 'mid of',
};

export const sampleWithPartialData: IAuditLog = {
  id: '63183a85-3fc2-4256-b2d3-bccd63759e36',
  actionType: 'throughout extent finally',
  userId: 'recompense',
  metadata: 'shyly enormously',
  createdBy: 'but politely',
  createdDate: dayjs('2026-05-12T14:10'),
  modifiedBy: 'underneath purse',
};

export const sampleWithFullData: IAuditLog = {
  id: '8e87c99c-58cd-4f22-b167-47ed80d48cda',
  actionType: 'pish',
  userId: 'hm against',
  metadata: 'towards hm',
  createdBy: 'mmm extent incidentally',
  createdDate: dayjs('2026-05-12T09:33'),
  modifiedBy: 'while',
  modifiedDate: dayjs('2026-05-12T16:36'),
};

export const sampleWithNewData: NewAuditLog = {
  actionType: 'far apricot',
  userId: 'gosh garage',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
