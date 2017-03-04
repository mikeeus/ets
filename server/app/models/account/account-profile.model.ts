import { Model } from '../model';
import { Validatable, Validator, ValidatorError } from '../../../common';

export class AccountProfile extends Model implements Validatable {
  private email: string;
  private first_name: string;
  private last_name: string;
  private display_name: string;
  private image_id: number;
  private role: string;
  
  constructor(data: any) {
    super(data.id);
    Object.keys(data).forEach(key => {
      if (ACCOUNT_PROFILE_KEYS.indexOf(key) != -1) {
        if (data.role != 'admin') {
          this[key] = data[key];
        }
      }
    });
    this.setDisplayName();
    if (this.role === null) { delete this.role; }
    if (this.image_id === null) { delete this.image_id; }    
  }

  setDisplayName() {
    if (this.first_name && this.last_name) {
      this.display_name =  this.first_name + ' ' + this.last_name;
    }
  }

  validate(): Array<ValidatorError> {
    return Validator.validate(this, AccountProfile.MODEL_CONSTRAINTS);
  }

  isValid() { return this.validate() === undefined; }

  toJSON(): any {
    return {
      first_name: this.first_name,
      last_name: this.last_name,
      display_name: this.display_name,
      image_id: this.image_id,
      role: this.role
    };
  }

  static readonly MODEL_CONSTRAINTS: any = {
    email: {
      email: {
        message: `doesn't look like a valid email` 
      },
      required: true,
      notNull: true
    },
    first_name: {
      required: true,
      notNull: true,
      length: {
        minimum: 3,
        message: 'must be at least 3 characters.'
      }
    },
    last_name: {
      required: true,
      notNull: true,
      length: {
        minimum: 3,
        message: 'must be at least 3 characters.'
      }
    },
    display_name: {
      required: true,
      notNull: true
    }
  } // MODEL_CONSTRAINTS
  
} //export class Type

const ACCOUNT_PROFILE_KEYS = [
  'email', 'first_name', 'last_name', 'image_id', 'role'
]
