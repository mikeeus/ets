import { ExportRecord } from '../models';
import { config } from '../../config';
import { RestController, handleError } from '../../common';
import { db } from '../../config/massive';

export class ExportController extends RestController {

  constructor() {
    super();
  }


  /**
   * GET
   */
  get(request, response) {
    let code = request.query.code;

    db.export_record.findOne({code: code}, (err, exportRecord) => {
      if (err) { handleError(response, err); }
      else {
        return this.respond(response, exportRecord);
      }
    });
  }
 

  /**
   * CREATE
   */
  create(request, response) {
    let newExportRecord = new ExportRecord(request.body);
    let validation = this.validateModel(response, newExportRecord);
    if (validation) {
      return this.respond(response, validation, validation['httpStatusCode']);
    }

    // insert export? or {code: ...}?
    db.export_record.insert(newExportRecord, (err, exportRecord) => {
      if (err) { handleError(response, err); }
      else {
        return this.respond(response, exportRecord);
      }
    });
  }


  /**
   * UPDATE
   */
  update(request, response) {
    let exportRecordToUpdate: ExportRecord = new ExportRecord(request.body);
    let validation = this.validateModel(response, exportRecordToUpdate);
    if (validation) {
      return this.respond(response, validation, validation['httpStatusCode']);
    }
    db.export_record.update(exportRecordToUpdate, (err, exportRecord) => {
      if (err) { handleError(response, err); }
      else {
        return this.respond(response, exportRecord);
      }
    });
  }


  /**
   * DELETE
   */
  delete(request, response) {
    let id = request.body.id;

    db.export_record.destroy({id: id}, (err, res) => {
      if (err) { handleError(response, err); }
      else {
        return this.respond(response, res);
      }
    });
  }

}
