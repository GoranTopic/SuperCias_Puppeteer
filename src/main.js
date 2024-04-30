import { read_json, mkdir } from 'files-js';
import setup_browser from './scripts/setup_browser.js';
import scrap_company from './scripts/scrap_company.js';
import close_browser from './scripts/close_browser.js';
import options from './options.js';
import make_logger from './utils/logger.js';
import init from './init.js';

const { proxies, store, checklist } = await init();

let proxy = await proxies.next();
let company = await checklist.next();
console.log('company', company);

// set up browser
let browser = await setup_browser(proxy);
// scrap company
let data = await scrap_company(browser, company);
// clean up
await close_browser( browser );

console.log(data);
if (data) {
    await store.push(company.ruc, data);
    checklist.check(company);
    console.log('checked');
}

