import { Model } from './model';
import { Validatable, Validator, ValidatorError } from '../../common';

export const IMPORT_RECORD_KEYS = [
  'hscode', 'year', 'month', 'cpc', 'origin_id', 'consignment_id', 'quantity',
  'mass_gross', 'mass_net', 'cif_etb', 'cif_usd', 'tax_etb', 'tax_usd',
  'modified_at', 'created_at'
];

export class ImportRecord extends Model implements Validatable {
  private hscode: string;
  private year: number;
  private month: number;
  private cpc: string;
  private origin_id: number;
  private consignment_id: number;
  private quantity: number;
  private mass_gross: number;
  private mass_net: number;
  private cif_etb: number;
  private cif_usd: number;
  private tax_etb: number;
  private tax_usd: number;
  private modified_at: Date;
  private created_at: Date;
  
  constructor(data: ImportRecordInterface) {
    super(data.id);
    Object.keys(data).forEach(key => {
      if (IMPORT_RECORD_KEYS.indexOf(key) != -1) {
        this[key] = data[key];
      }
    });
  }

  validate(): Array<ValidatorError> {
    return Validator.validate(this, ImportRecord.MODEL_CONSTRAINTS);
  }

  isValid() { return this.validate() === undefined; }

  toJSON(): any {
    let jsonObj = {};
    IMPORT_RECORD_KEYS.forEach(key => {
      jsonObj[key] = this[key];
    });
    return jsonObj;
  }

  static readonly MODEL_CONSTRAINTS: any = {
    hscode: { required: true, notNull: true },
    year: { required: true, notNull: true },
    month: { required: true, notNull: true },
    cpc: { required: true, notNull: true },
    origin_id: { required: true, notNull: true },
    consignment_id: { required: true, notNull: true },
    mass_gross: { required: true, notNull: true },
    mass_net: { required: true, notNull: true },
    cif_etb: { required: true, notNull: true },
    cif_usd: { required: true, notNull: true },
    tax_etb: { required: true, notNull: true },
    tax_usd: { required: true, notNull: true },
  }
}

export interface ImportRecordInterface {
  id?: number;
  hscode: string;
  year: number;
  month: number;
  cpc: string;
  origin_id: number;
  consignment_id: number;
  quantity?: number;
  mass_gross: number;
  mass_net: number;
  cif_etb: number;
  cif_usd: number;
  tax_etb: number;
  tax_usd: number;
  modified_at: Date;
  created_at: Date;
}
