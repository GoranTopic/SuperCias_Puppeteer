import { read_json, mkdir } from 'files-js';
import setup_browser from './scripts/setup_browser.js';
import scrap_company from './scripts/scrap_company.js';
import close_browser from './scripts/close_browser.js';
import options from './options.js';
import make_logger from './utils/logger.js';
import init from './init.js';


const { proxies, store, checklist } = await init();

//let console = make_logger({ ruc: company.ruc, proxy });


let store = await storage.open('supercias');

mkdir(options.files_path);

// Read the file
let checklist = new Checklist(
    read_json('./storage/ids/company_ids.json'),
    {
        name: 'company_ids',
        path: './storage/checklists',
        shuffle: true,
        recalc_on_check: false,
    });
let company = checklist.next();

// proxies
let proxies = new ProxyRotator('./storage/proxies/proxyscrape_premium_http_proxies.txt');
let proxy = proxies.next();

// set up browser
let browser = await setup_browser(proxy);
// scrap company
let data = await scrap_company( browser, company);
// clean up
await close_browser( browser );

console.log(data);
if (data) {
    await store.push(company.ruc, data);
    checklist.check(company);
    console.log('checked');
}
*/
