const xlsx = require('xlsx');
const ProgressBar = require('progress');
// Database connection
const massive = require('massive');
const connectionString = 'postgres://mikmak:password@localhost/ets';
const db = massive.connectSync({ connectionString: connectionString });
const globbed = require('./globbed');

const recordsPath = '../records';

const importRecords = globbed.getGlobbedFiles(`${recordsPath}/**/import*.xls*`)
// const exportRecords = globbed.getGlobbedFiles(`${recordsPath}/**/export*.xls*`)
exportRecords = ['../records/exports/export_2007.xls'];

// Download records from erca
// check to see if this works with checkExistingExportRecord()
// import all export records

exportRecords.forEach(recordPath => {
  console.log('Importing: ', recordPath);
  var workbook = xlsx.readFile(__dirname + '/' + recordPath);

  var sheet = workbook.Sheets['Sheet 1'];
  var rows = xlsx.utils.sheet_to_json(sheet);
  
  // rows = rows.slice(0,10);
  let bar = new ProgressBar(':current :percent :bar :eta', {
    total: rows.length,
    incomplete: '-',
    complete: '|'
  });
  
  let headings = [
    'Year', 'Month', 'CPC', 'HS Code', 'HS Description', 'Destination',
    'Quantity', 'Unit', 'Gross Wt. (Kg)', 'Net.Wt. (Kg)', 'FOB Value (ETB)', 
    'FOB Value (USD)', 'Total tax (ETB)', 'Total tax (USD)'
  ]

  importRowsRecursively(rows, bar, () => {
    console.log(`${recordPath} imported successfully!`);
    process.exit();
  });
});


function importRowsRecursively(rows, bar, cb) {
  let row = rows.shift();
  
  db.hscode.findOne({code: row['HS Code']}, (err, hscode) => {
    if (err) { throw err; }
    if (!hscode) {
      return console.log('No hscode: ', row['HS Code']);
    }
    db.run(`
      SELECT *
      FROM country
      WHERE $1 ILIKE name OR $1 ILIKE ANY (aliases)
    `, [row['Destination']], (err, destination) => {
      if (err) {
        return handleError(err, `Db error on ${row}`, 'export', row['Year']);
      }
      if (destination.length === 0) {
        return console.log(`No country found: ${row['Destination']}`);
      }
      checkExistingExportRecord(row, hscode, destination, (err, existing) => {
        if (err) {
          return handleError(err, `DB error on: ${row}`, 'export', row['Year']);
        }
        if (existing) {
          bar.tick();
          if (bar.complete) {
            cb();
          } else {
            importRowsRecursively(rows, bar, cb);
          }
        }
        if (!existing) {
          let quantity = (row['Quantity']) 
            ? row['Quantity'].replace(/,/g, '')
            : null;
          db.export_record.insert({
            hscode: hscode.code,
            year: row['Year'],
            month: row['Month'],
            cpc: row['CPC'],
            destination_id: destination[0].id,
            quantity: quantity,
            mass_gross: row['Gross Wt. (Kg)'].replace(/,/g, ''),
            mass_net: row['Net.Wt. (Kg)'].replace(/,/g, ''),
            fob_etb: row['FOB Value (ETB)'].replace(/,/g, ''),
            fob_usd: row['FOB Value (USD)'].replace(/,/g, ''),
            tax_etb: row['Total tax (ETB)'].replace(/,/g, ''),
            tax_usd: row['Total tax (USD)'].replace(/,/g, '')
          }, (err, exportRecord) => {
            if (err) {
              return handleError(err, `Db error on ${JSON.stringify(row)}`, 'export', row['Year']);
            }
            bar.tick();
            if (bar.complete) {
              cb();
            } else {
              importRowsRecursively(rows, bar, cb);
            }
          });
        }
      }); // db.run()
    });
  }); //db.hscode.findOne()
}

function checkExistingExportRecord(row, hscode, destination, cb) {
  let quantity = (row['Quantity']) 
    ? row['Quantity'].replace(/,/g, '')
    : null;
  db.export_record.findOne({
    hscode: hscode.code,
    year: row['Year'],
    month: row['Month'],
    cpc: row['CPC'],
    destination_id: destination[0].id,
    quantity: quantity,
    mass_gross: row['Gross Wt. (Kg)'].replace(/,/g, ''),
    mass_net: row['Net.Wt. (Kg)'].replace(/,/g, ''),
    fob_etb: row['FOB Value (ETB)'].replace(/,/g, ''),
    fob_usd: row['FOB Value (USD)'].replace(/,/g, ''),
    tax_etb: row['Total tax (ETB)'].replace(/,/g, ''),
    tax_usd: row['Total tax (USD)'].replace(/,/g, '')
  }, (err, existing) => {
    if (err) {
      return cb(err);
    }
    if (existing) {
      return cb(null, true);
    }
    if (!existing) {
      cb(null);
    }
  });
}

function handleError(error, message, type, year) {
  if (type === 'export') {
    db.export_record.destroy({year: year}, (err, destroyed) => {
      if (err) {
        return console.error('Error destroying export records for the year: ', year, ' as a result of this error: ', err);
      }
      throw Object.assign(error, {message: `${message} - ${error.message}`});
    });
  }
  if (type === 'import') {
    db.import_record.destroy({year: year}, (err, destroyed) => {
      if (err) {
        return console.error('Error destroying import records for the year: ', year, ' as a result of this error: ', err);
      }
      throw Object.assign(error, {message: `${message} - ${error.message}`});
    });
  }
}


// importRecords.forEach(recordPath => {
//   var workbook = xlsx.readFile(__dirname + recordPath);

//   var sheet = workbook.Sheets['Sheet 1'];
//   var rows = xlsx.utils.sheet_to_json(sheet);

//   let headings = [
//     'Year', 'Month', 'CPC', 'HS Code', 'HS Description', 'Country (Origin)',
//     'Country (Consignment)', 'Quantity', 'Unit', 'Gross Wt. (Kg)',
//     'Net Wt. (Kg)', 'CIF Value (ETB)', 'CIF Value (USD)', 'Total tax (ETB)', 'Total tax (USD)'
//   ]
//   rows.forEach(row => {
//     db.hscode.findOne({code: row['HS Code']}, (err, hscode) => {
//       if (err) { throw err; }
//       if (!hscode) {
//         console.log('No hscode: ', row['HS Code']);
//       }
//       let origin = row['Country (Origin)'];
//       db.run(`
//         SELECT *
//         FROM country
//         WHERE $1 ILIKE name OR $1 ILIKE ANY (aliases)
//       `, [origin], (err, country_origin) => {
//         if (err) {
//           return console.error(`Db error on ${origin}: `, err);
//         }
//         if (country_origin.length === 0) {
//           return console.error(`No country found: ${origin}: `);
//         }
//         let consignment = row['Country (Consignment)'];
//         db.run(`
//           SELECT *
//           FROM country
//           WHERE $1 ILIKE name OR $1 ILIKE ANY (aliases)
//         `, [consignment], (err, country_consignment) => {
//           if (err) {
//             return console.error(`Db error on ${consignment}: `, err);
//           }
//           if (country_consignment.length === 0) {
//             return console.error(`No country found: ${consignment}: `);
//           }
//           db.import_record.insert({
//             hscode: hscode.code,
//             year: row['Year'],
//             month: row['Month'],
//             cpc: row['CPC'],
//             origin_id: country_origin[0].id, // NEED TO ADD COUNTRIES FIRST
//             consignment_id: country_consignment[0].id, // NEED TO ADD COUNTRIES FIRST        
//             quantity: row['Quantity'],
//             mass_gross: row['Gross Wt. (Kg)'],
//             mass_net: row['Net Wt. (Kg)'],
//             cif_etb: row['CIF Value (ETB)'],
//             cif_usd: row['CIF Value (USD)'],
//             tax_etb: row['Total tax (ETB)'],
//             tax_usd: row['Total tax (USD)']
//           });
//         });
//       });
//     });
//   });
// });

