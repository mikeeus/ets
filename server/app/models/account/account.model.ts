import { Model } from '../model';
import { Validatable, Validator, ValidatorError } from '../../../common';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { db } from '../../../config/massive';

export class Account extends Model implements Validatable {
  private account_profile_id: number;
  private email: string;
  private password: string;
  private salt: string;
  private hash_algorithm: string;
  private confirmation_status: number;
  private email_confirmation_token: string;
  private password_reset_token: string;
  private password_reset_expiration: Date;
  
  constructor(data: any) {
    super(data.id);
    Object.keys(data).forEach(key => {
      if (ACCOUNT_KEYS.indexOf(key) != -1) {
        this[key] = data[key];
      }
    });
  }


  preSave(cb) {
    // 
    if (this.password && this.password.length > 6) {
      this.salt = randomBytes(16).toString('base64');
      this.hash_algorithm = 'sha512';
      this.password = this.hashPassword(this.password);
      cb (null);
    } else {
      cb(new Error('invalid password'));
    }
  }

  hashPassword(password) {
    if (this.salt && password) {
      return pbkdf2Sync(password, this.salt, 10000, 64, this.hash_algorithm).toString('base64');
    } else {
      return password;
    }
  }

  authenticate(password) {
    return this.password === this.hashPassword(password);
  }

  validate(): Array<ValidatorError> {
    return Validator.validate(this, Account.MODEL_CONSTRAINTS);
  }

  isValid() { return this.validate() === undefined; }

  toJSON(): any {
    return {
      account_profile_id: this.account_profile_id,
      email: this.email,
      confirmation_status: this.confirmation_status
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
    password: {
      required: true,
      notNull: true,
      length: {
        minimum: 6,
        message: 'must be at least 6 characters.'
      }
    },
    salt: {
      required: true,
      notNull: true,
    },
    hash_algorithm: {
      required: true,
      notNull: true,
    }
  } // MODEL_CONSTRAINTS
  

} //export class Type

const ACCOUNT_KEYS = [
  'email', 'password', 'salt', 'hash_algorithm', 'confirmation_status', 
  'email_confirmation_token', 'password_reset_token'
]
