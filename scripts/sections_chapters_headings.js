const fs = require('fs');
const xlsx = require('xlsx');
const ProgressBar = require('progress');
// Database connection
const massive = require('massive');
const connectionString = 'postgres://mikmak:password@localhost/ets';
const db = massive.connectSync({ connectionString: connectionString });

const hscodesFilePath = '/../records/HSProducts.xls';

var workbook = xlsx.readFile(__dirname + hscodesFilePath);

var sheet = workbook.Sheets['HS Nomenclature'];
var rows = xlsx.utils.sheet_to_json(sheet);

/**
 * Insert empty chapter for a section. Also inserts empty chapter for itself.
 * @param {string} section The section code that the new chapter belongs to.
 */
function insertEmptyChapter(section) {
  db.chapter.insert({ code: `${section}00`, section: section, description: ''}, (err, chapter) => {
    if (err) { throw err; }
    insertEmptyHeading(chapter.code);
  });
}

/**
 * Insert empty heading record for a chapter.
 * @param {string} chapter The chapter code that the new heading belongs to.
 */
function insertEmptyHeading(chapter) {
  // Insert empty chapter value for each section
  db.heading.insert({ code: `${chapter}00`, chapter: chapter, description: ''}, (err, heading) => {
    if (err) { throw err; }
  });
}

/**
 * Import sections. Also inserts empty chapter and heading for each section.
 * @param {any} rows The rows to be checked and imported.
 */
function importSections(rows, cb) {
  console.log('Importing sections.');
  let sections = rows.filter(row => row.tier === '1');
  let bar = new ProgressBar(':current :percent :bar :eta', { total: sections.length, complete: '|', incomplete: '-'});
  sections.forEach(section => {
    bar.tick();
    db.section.insert({code: section.code, description: section.description}, (err, s) => {
      if (err) { throw err; }
      insertEmptyChapter(s.code);
    });
    if (bar.complete) {
      cb();
    }
  });
}

/**
 * Import chapters by finding the parent section, then using that as the 
 * foreign key. Also inserts the empty heading for each chapter.
 * @param {any} rows The rows to be checked and imported.
 */
function importChapters(row, cb) {
  console.log('Importing chapters.');  
  let chapters = rows.filter(row => row.tier === '2');
  let bar = new ProgressBar(':current :percent :bar :eta', { total: chapters.length, complete: '|', incomplete: '-'});
  chapters.forEach(chapter => {
    db.section.findOne({code: chapter.code.slice(0,2)}, (err, section) => {
      if (err) { throw err; }
      if (!section) {
        throw new Error('No parent section for: ', chapter.code);
      }
      db.chapter.insert({code: chapter.code, section: section.code, 
        description: chapter.description}, (err, c) => {
        if (err) { throw err; }
        bar.tick();
        if (bar.complete) {
          cb();
        }
      });
    });
  });
}

/**
 * Import headings by finding the parent chapter, then using that as the foreign key.
 * @param {any} rows The rows to be checked and imported.
 */
function importHeadings(row, cb) {
  console.log('Importing headings.');  
  let headings = rows.filter(row => row.tier === '3');
  let bar = new ProgressBar(':current :percent :bar :eta', { total: headings.length, complete: '|', incomplete: '-'});
  headings.forEach(heading => {
    db.chapter.findOne({code: heading.code.slice(0,4)}, (err, chapter) => {
      if (err) { throw err; }
      if (!chapter) {
        throw new Error('No parent chapter for: ', heading.code);
      }
      db.heading.insert({code: heading.code, chapter: chapter.code, 
        description: heading.description}, (err, heading) => {
        if (err) { throw err; }
        bar.tick();
        if (bar.complete) {
          process.exit();
        }
      });
    });
  });
}


// ?
function handleError(message) {
  db.section.delete({}, (err) => {
    if (err) { throw new Error()};
  });
  db.chapter.delete({}, (err) => {
    if (err) { throw new Error()};
  });
  db.heading.delete({}, (err) => {
    if (err) { throw new Error()};
  });
  throw new Error(message);
}


// Call the functions
importSections(rows, () => {
  importChapters(rows, () => {
    importHeadings(rows);
  });
});
