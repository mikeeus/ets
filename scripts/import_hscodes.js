const fs = require('fs');
const xlsx = require('xlsx');
const ProgressBar = require('progress');
// Database connection
const massive = require('massive');
const connectionString = 'postgres://mikmak:password@localhost/ets';
const db = massive.connectSync({ connectionString: connectionString });

const hscodesFilePath = '/../records/Ethiopian_import_tariff_rate.xls';

var workbook = xlsx.readFile(__dirname + hscodesFilePath);

var sheet = workbook.Sheets['Sheet 1'];
var rows = xlsx.utils.sheet_to_json(sheet);

importHscodes(rows);
/**
 * Import HS Codes.
 * @param {rows} rows The spreadsheet rows to be imported.
 */
function importHscodes(rows) {
  let bar = new ProgressBar(':current :percent :bar :eta', { total: rows.length, complete: '|', incomplete: '-'});
  rows.forEach(row => {
    let hscode = Object.assign({}, row, {
      section: row.code.slice(0,2),
      chapter: row.code.slice(0,4),
      heading: row.code.slice(0,6)
    });
    db.section.findOne({code: row.code.slice(0,2)}, (err, section) => {
      if (err) { return console.error('Section: ', section.code, '  |  ', err); }
      if (!section) {
        console.log('Section: ', row.code.slice(0,2), ' does not exist.');
      }
      db.chapter.findOne({code: row.code.slice(0,4)}, (err, chapter) => {
        if (err) { return console.error('Chapter: ', chapter.code, '  |  ', err); }
        if (!chapter) {
          console.log('Chapter: ', row.code.slice(0,4), ' does not exist.');
        }
        db.heading.findOne({code: row.code.slice(0,6)}, (err, heading) => {
          if (err) { return console.error('Heading: ', heading.code, '  |  ', err); }
          if (!heading) {
            console.log('Heading: ', row.code.slice(0,6), ' does not exist. Will be added.');
            db.heading.insert({
              code: row.code.slice(0,6),
              chapter: row.code.slice(0,4),
              description: row.description
            }, (err, newHeading) => {
              db.hscode.insert(hscode, (err, hscode) => {
                if (err) { 
                  return console.error('Hscode: ', row.code, '  |  ', err); 
                }
                bar.tick();
                if (bar.complete) {
                  process.exit();
                }
              });
            })
          } else {
            db.hscode.insert(hscode, (err, hscode) => {
              if (err) {
                return console.error('Hscode: ', row.code, '  |  ', err); 
              }
              bar.tick();
              if (bar.complete) {
                process.exit();
              }
            });
          }
        })
      })
    })
    // // console.log('row: ', row);
    // let trimmed = trimZeroes(row.code);
    // // if this is a section
    // if (trimmed.length <= 2) {

    // } else if (trimmed.length <= 4) {
    //   let hscode = Object.assign({}, row, {
    //     section: row.code.slice(0,2),
    //     chapter: row.code.slice(0,4),
    //     heading: '000000'
    //   });
    //   db.hscode.insert(hscode, (err, hscode) => {
    //     if (err) { throw err; }
    //   });
    // } else {
    //   let hscode = Object.assign({}, row, {
    //     section: row.code.slice(0,2),
    //     chapter: row.code.slice(0,4),
    //     heading: row.code.slice(0,6)
    //   });
    //   db.hscode.insert(hscode, (err, hscode) => {
    //     if (err) { throw err; }
    //   });
    // }
  });
}


/**
 * Removes trailing '0's.
 * @param {string} code The code to be trimmed. 
 */
function trimZeroes(code) {
  let len = code.length;
  let c = code.split('');
  for (let i = len - 1; i >= 0; i--) { 
    if (c[i] === '0') {
      c.pop();
    } 
    else { 
      break;
    }
  }
  return c.join();
}

/**
 * Parse row into hscode.
 * @param {any} row The row to be parsed.
 * @return {any}
 */
function getHscodeFromRow(row) {
  return {
    code: row.code,
    description: row.description,
    unit: row.unit,
    special_permission: row.special_permission,
    duty: row.duty,
    excise: row.excise,
    vat: row.vat,
    sur: row.sur,
    withholding: row.withholding,
    'SS-1': row['SS-1'],
    'SS-2': row['SS-2']
  }
}
