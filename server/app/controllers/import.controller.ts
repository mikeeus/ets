import { ImportRecord } from '../models';
import { config } from '../../config';
import { RestController, handleError } from '../../common';
import { db } from '../../config/massive';

export class ImportController extends RestController {

  constructor() {
    super();
  }


  /**
   * GET
   */
  get(request, response) {
    let code = request.query.code;

    db.import_record.findOne({code: code}, (err, importRecord) => {
      if (err) { handleError(response, err); }
      else {
        return this.respond(response, importRecord);
      }
    });
  }
 

  /**
   * CREATE
   */
  create(request, response) {
    let newImportRecord = new ImportRecord(request.body);
    let validation = this.validateModel(response, newImportRecord);
    if (validation) {
      return this.respond(response, validation, validation['httpStatusCode']);
    }

    // insert import? or {code: ...}?
    db.import_record.insert(newImportRecord, (err, importRecord) => {
      if (err) { handleError(response, err); }
      else {
        return this.respond(response, importRecord);
      }
    });
  }


  /**
   * UPDATE
   */
  update(request, response) {
    let importRecordToUpdate: ImportRecord = new ImportRecord(request.body);
    let validation = this.validateModel(response, importRecordToUpdate);
    if (validation) {
      return this.respond(response, validation, validation['httpStatusCode']);
    }
    db.import_record.update(importRecordToUpdate, (err, importRecord) => {
      if (err) { handleError(response, err); }
      else {
        return this.respond(response, importRecord);
      }
    });
  }


  /**
   * DELETE
   */
  delete(request, response) {
    let id = request.body.id;

    db.import_record.destroy({id: id}, (err, res) => {
      if (err) { handleError(response, err); }
      else {
        return this.respond(response, res);
      }
    });
  }

}
