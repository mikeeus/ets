import { Model } from './model';
import { Validatable, Validator, ValidatorError } from '../../common';

export const EXPORT_RECORD_KEYS = [
  'hscode', 'year', 'month', 'cpc', 'destination_id', 'quantity',
  'mass_gross', 'mass_net', 'fob_etb', 'fob_usd', 'tax_etb', 'tax_usd',
  'modified_at', 'created_at'
];

export class ExportRecord extends Model implements Validatable {
  private hscode: string;
  private year: number;
  private month: number;
  private cpc: string;
  private destination_id: number;
  private quantity: number;
  private mass_gross: number;
  private mass_net: number;
  private fob_etb: number;
  private fob_usd: number;
  private tax_etb: number;
  private tax_usd: number;
  private modified_at: Date;
  private created_at: Date;
  
  constructor(data: ExportRecordInterface) {
    super(data.id);
    Object.keys(data).forEach(key => {
      if (EXPORT_RECORD_KEYS.indexOf(key) != -1) {
        this[key] = data[key];
      }
    });
  }

  validate(): Array<ValidatorError> {
    return Validator.validate(this, ExportRecord.MODEL_CONSTRAINTS);
  }

  isValid() { return this.validate() === undefined; }

  toJSON(): any {
    let jsonObj = {};
    EXPORT_RECORD_KEYS.forEach(key => {
      jsonObj[key] = this[key];
    });
    return jsonObj;
  }

  static readonly MODEL_CONSTRAINTS: any = {
    hscode: { required: true, notNull: true },
    year: { required: true, notNull: true },
    month: { required: true, notNull: true },
    cpc: { required: true, notNull: true },
    destination_id: { required: true, notNull: true },
    mass_gross: { required: true, notNull: true },
    mass_net: { required: true, notNull: true },
    fob_etb: { required: true, notNull: true },
    fob_usd: { required: true, notNull: true },
    tax_etb: { required: true, notNull: true },
    tax_usd: { required: true, notNull: true },
  }
}

export interface ExportRecordInterface {
  id?: number;
  hscode: string;
  year: number;
  month: number;
  cpc: string;
  destination_id: number;
  quantity?: number;
  mass_gross: number;
  mass_net: number;
  fob_etb: number;
  fob_usd: number;
  tax_etb: number;
  tax_usd: number;
  modified_at: Date;
  created_at: Date;
}
