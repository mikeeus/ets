import { Model } from './model';
import { Validatable, Validator, ValidatorError } from '../../common';

export const HSCODE_KEYS = [
  'code', 'section', 'heading', 'description', 'unit', 'special_permissions',
  'duty', 'excise', 'vat', 'sur', 'withholding', 'SS-1', 'SS-2', 'modified_at',
  'created_at'
];

export class Hscode extends Model implements Validatable {
  private code: string;
  private section: number;
  private heading: number;
  private description: string;
  private unit: string;
  private special_permissions: string;
  private duty: number;
  private excise: number;
  private vat: number;
  private sur: number;
  private withholding: number;
  private 'SS-1': number;
  private 'SS-2': number;
  private modified_at: Date;
  private created_at: Date;
  
  constructor(data: any) {
    super(data.id);
    Object.keys(data).forEach(key => {
      if (HSCODE_KEYS.indexOf(key) != -1) {
        this[key] = data[key];
      }
    });
  }

  validate(): Array<ValidatorError> {
    return Validator.validate(this, Hscode.MODEL_CONSTRAINTS);
  }

  isValid() { return this.validate() === undefined; }

  toJSON(): any {
    let jsonObj = {};
    HSCODE_KEYS.forEach(key => {
      jsonObj[key] = this[key];
    });
    return jsonObj;
  }

  static readonly MODEL_CONSTRAINTS: any = {
    code: { required: true, notNull: true },
    section: { required: true, notNull: true },
    heading: { required: true, notNull: true },
    description: { required: true, notNull: true },
    unit: { required: true, notNull: true },
    duty: { required: true, notNull: true },
    excise: { required: true, notNull: true },
    vat: { required: true, notNull: true },
    sur: { required: true, notNull: true },
    withholding: { required: true, notNull: true }
  }
}

export interface HscodeInterface {
  code: string;
  section: number;
  heading: number;
  description: string;
  unit: string;
  special_permissions?: string;
  duty: number;
  excise: number;
  vat: number;
  sur: number;
  withholding: number;
  'SS-1'?: number;
  'SS-2'?: number;
  modified_at?: Date;
  created_at?: Date;
}
