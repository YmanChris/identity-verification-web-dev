
export type Country = 'CN' | 'SG';

export enum DocType {
  NATIONAL_ID = 'National ID',
  PASSPORT = 'Passport',
  DRIVERS_LICENSE = 'Driver\'s License',
  RESIDENCE_PERMIT = 'Residence Permit'
}

export type DocSide = 'FRONT' | 'BACK';

export type Step = 'SELECTION' | 'CHOOSE_METHOD' | 'CAMERA' | 'UPLOAD' | 'SUCCESS';
