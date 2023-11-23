import fs from 'fs';
import scrap_company from './scripts/scrap_company.js';
import Checklist from 'checklist-js';

// Read the file
let rawdata = fs.readFileSync('../storage/ids/company_ids.json')

// Parse the data
let data = JSON.parse(rawdata);

// Print the data
console.log(data);