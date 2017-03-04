import { Hscode } from '../models';
import { config } from '../../config';
import { RestController, handleError } from '../../common';
import { db } from '../../config/massive';

export class HscodeController extends RestController {

  constructor() {
    super();
  }


  /**
   * LIST
   */
  list(request, response) {
    db.hscode.find({}, (err, hscodes) => {
      if (err) { return handleError(response, err); }
      return this.respond(response, hscodes);
    });
  }


  /**
   * GET
   */
  get(request, response) {
    let code = request.query.code;

    db.hscode.findOne({code: code}, (err, hscode) => {
      if (err) { handleError(response, err); }
      else {
        return this.respond(response, hscode);
      }
    });
  }
 

  /**
   * CREATE
   */
  create(request, response) {
    let hscode = new Hscode(request.body);
    let validation = this.validateModel(response, hscode);
    if (validation) {
      return this.respond(response, validation, validation['httpStatusCode']);
    }

    // insert hscode? or {code: ...}?
    db.hscode.insert(hscode, (err, res) => {
      if (err) { handleError(response, err); }
      else {
        return this.respond(response, res);
      }
    });
  }


  /**
   * UPDATE
   */
  update(request, response) {
    let hscodeToUpdate: Hscode = new Hscode(request.body);
    let validation = this.validateModel(response, hscodeToUpdate);
    if (validation) {
      return this.respond(response, validation, validation['httpStatusCode']);
    }
    db.hscode.update(hscodeToUpdate, (err, res) => {
      if (err) { handleError(response, err); }
      else {
        return this.respond(response, res);
      }
    });
  }


  /**
   * DELETE
   */
  delete(request, response) {
    let id = request.body.id;

    db.hscode.destroy({id: id}, (err, res) => {
      if (err) { handleError(response, err); }
      else {
        return this.respond(response, res);
      }
    });
  }

}
