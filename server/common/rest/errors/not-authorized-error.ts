import { RestError } from './rest-error';

export class NotAuthorizedError extends RestError {

  constructor(
    public message: string = 'Not authorized.'
  ) {
    super(message, 401, 'NOT_AUTHORIZED');
    this.name = 'NotAuthorizedError';
  }

}
