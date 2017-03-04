import { Request, Response } from 'express';
import { RestResponse } from '../rest-response';
import { RestError, ResourceNotFoundError, InternalError, InvalidJsonError,
  InvalidResourceUrlError, MethodNotAllowedError, NotAuthorizedError
} from '../errors';

/**
 * HELPER FUNCTIONS
 */
export function handleError(res: Response, err: any, status: number = 400, validation: boolean = false) {
  let error = getErrorFromStatus(status, err);
  let restResponse = new RestResponse(err);
  if (error.httpStatusCode === 500) {
    console.error(restResponse);;
    return res.status(status).json(new InternalError(new Error('internal error')))
  } else {
    return res.status(status).json(restResponse);
  }
}

function getErrorFromStatus(status, err) {
  switch (status) {
    case 400:
      return new InvalidJsonError(err);
    case 401:
      return new NotAuthorizedError(err);
    case 404:
      return new ResourceNotFoundError(err);
    case 405:
      return new MethodNotAllowedError(err);
    case 500:
      return new InternalError(err);
  }
}