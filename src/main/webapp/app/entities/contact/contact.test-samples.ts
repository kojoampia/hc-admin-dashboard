import { IContact, NewContact } from './contact.model';

export const sampleWithRequiredData: IContact = {
  id: '51496ad7-5b7c-4ec5-9db5-0780ccafed87',
  personId: 'ew',
  email: 'Leonora.Kunde98@yahoo.com',
  phoneNumber: '95',
  countryCode: 1423,
};

export const sampleWithPartialData: IContact = {
  id: '86c78637-b436-487a-94e6-9d43b6d622ee',
  personId: 'consequently',
  email: 'Dedrick_Greenfelder@gmail.com',
  phoneNumber: undefined,
  countryCode: 5083,
};

export const sampleWithFullData: IContact = {
  id: '2dab85eb-f4e2-458b-93be-772fc348f9ca',
  personId: 'neatly selfish whoever',
  email: 'Samson_Gorczany22@gmail.com',
  phoneNumber: '1814',
  countryCode: 31315,
};

export const sampleWithNewData: NewContact = {
  personId: 'standard but',
  email: 'Estelle93@yahoo.com',
  phoneNumber: undefined,
  countryCode: 1644,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
