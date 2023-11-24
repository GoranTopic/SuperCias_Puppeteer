import { read_json, mkdir } from 'files-js';
import scrap_company from './scripts/scrap_company.js';
import Checklist from 'checklist-js';
import Storage from 'storing-me'
import options from './options.json' assert { type: 'json' };

let storage = new Storage({
        type: 'json',
        keyValue: true,
        path: options.data_path, // default: ./storage/
    });

let store = await storage.open('supercias')

mkdir(options.files_path);

// Read the file
let company_ids = read_json('./storage/ids/company_ids.json')

let checklist = new Checklist(company_ids, {
    name: 'company_ids',
    path: './storage/checklists',
    recalc_on_check: false,
});

let company = checklist.next();

let data = await scrap_company( { company });

console.log(data);

if (data) {
    await store.push(company.ruc, data);
    checklist.check(company);
    console.log('checked');
}