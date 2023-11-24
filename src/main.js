import fs from 'fs';
import scrap_company from './scripts/scrap_company.js';
import Checklist from 'checklist-js';

// Read the file
let company_ids = JSON.parse(fs.readFileSync('./storage/ids/company_ids.json'));

let checklist = new Checklist(company_ids, {
    name: 'company_ids',
    path: './storage/checklists',
    recalc_on_check: false,
});

let company = checklist.next();

await scrap_company( { company });