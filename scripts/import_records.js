const xlsx = require('xlsx');
const ProgressBar = require('progress');
// Database connection
const massive = require('massive');
const connectionString = 'postgres://mikmak:password@localhost/ets';
const db = massive.connectSync({ connectionString: connectionString });
const globbed = require('./globbed');

const recordsPath = '../records';

const importRecords = globbed.getGlobbedFiles(`${recordsPath}/**/import*.xls*`)
const exportRecords = globbed.getGlobbedFiles(`${recordsPath}/**/export*.xls*`)

console.log('Import record paths: ', importRecords);
console.log('Export record paths: ', exportRecords);

process.exit();

exportRecords.forEach(recordPath => {
  var workbook = xlsx.readFile(__dirname + recordPath);

  var sheet = workbook.Sheets['Sheet 1'];
  var rows = xlsx.utils.sheet_to_json(sheet);

  let headings = [
    'Year', 'Month', 'CPC', 'HS Code', 'HS Description', 'Destination',
    'Quantity', 'Unit', 'Gross Wt. (Kg)', 'Net.Wt. (Kg)', 'FOB Value (ETB)', 
    'FOB Value (USD)', 'Total tax (ETB)', 'Total tax (USD)'
  ]
  rows.forEach(row => {
    db.hscode.findOne({code: row['HS Code']}, (err, hscode) => {
      if (err) { throw err; }
      if (!hscode) {
        console.log('No hscode: ', row['HS Code']);
      }
      db.export_record.insert({
        hscode: hscode.code,
        year: row['Year'],
        month: row['Month'],
        cpc: row['CPC'],
        destination_id: , // NEED TO ADD COUNTRIES FIRST
        quantiy: row['Quantity'],
        mass_gross: row['Gross Wt. (Kg)'],
        mass_net: row['Net.Wt. (Kg)'],
        fob_etb: row['FOB Value (ETB)'],
        fob_usd: row['FOB Value (USD)'],
        tax_etb: row['Total tax (ETB)'],
        tas_usd: row['Total tax (USD)']
      })
    })
  })
})



      db.import_record.insert({
        hscode: hscode.code,
        year: row['Year'],
        month: row['Month'],
        cpc: row['CPC'],
        origin_id: , // NEED TO ADD COUNTRIES FIRST
        consignment_id: , // NEED TO ADD COUNTRIES FIRST        
        quantiy: row['Quantity'],
        mass_gross: row['Gross Wt. (Kg)'],
        mass_net: row['Net.Wt. (Kg)'],
        cif_etb: row['CIF Value (ETB)'],
        cif_usd: row['CIF Value (USD)'],
        tax_etb: row['Total tax (ETB)'],
        tas_usd: row['Total tax (USD)']
      })