import dayjs from 'dayjs/esm';

import { IDocumentItem, NewDocumentItem } from './document-item.model';

export const sampleWithRequiredData: IDocumentItem = {
  id: '3f19d52d-3d6f-4faf-b0e8-8f24e9a393ff',
  name: 'which responsible blissfully',
  description: 'monthly worth easy',
  documentType: 'CERTIFICATE',
  url: 'https://evil-elver.biz',
  createdDate: dayjs('2026-05-12T01:29'),
  createdBy: 'owlishly inside',
  modifiedDate: dayjs('2026-05-12T17:39'),
  modifiedBy: 'meadow geez',
};

export const sampleWithPartialData: IDocumentItem = {
  id: '53e910fe-5517-4e0e-aed3-c0684b988743',
  name: 'indeed metabolite',
  description: 'personal shirk',
  documentType: 'PROFESSIONAL_LICENSE',
  url: 'https://smoggy-loyalty.com/',
  createdDate: dayjs('2026-05-12T07:05'),
  createdBy: 'gad inferior',
  modifiedDate: dayjs('2026-05-12T05:25'),
  modifiedBy: 'gee',
};

export const sampleWithFullData: IDocumentItem = {
  id: '030dd0c3-6748-4cde-8f29-f75f93fcc53e',
  name: 'delirious',
  description: 'seafood seagull',
  documentType: 'DRIVER_LICENSE',
  url: 'https://wrathful-tentacle.biz/',
  createdDate: dayjs('2026-05-12T07:52'),
  createdBy: 'oh',
  modifiedDate: dayjs('2026-05-12T02:12'),
  modifiedBy: 'and curiously',
};

export const sampleWithNewData: NewDocumentItem = {
  name: 'tabletop fatally',
  description: 'gosh tenant',
  documentType: 'DRIVER_LICENSE',
  url: 'https://bitter-palate.name',
  createdDate: dayjs('2026-05-12T20:06'),
  createdBy: 'terrible',
  modifiedDate: dayjs('2026-05-12T16:26'),
  modifiedBy: 'reassuringly almost',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
