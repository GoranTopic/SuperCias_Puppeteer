import setup_browser from './scripts/setup_browser.js';
import scrap_company from './scripts/scrap_company.js';
import close_browser from './scripts/close_browser.js';
import init from './init.js';

const { proxies, store, fileStore, checklist } = await init();

let proxy = await proxies.next();
let company = await checklist.next();
console.log('gottten company', company);

// set up browser
let browser = await setup_browser(proxy);
// save fileStore in to the page so that it can be used in the browser
(await browser.pages())[0]['fileStore'] = fileStore;
// scrap company
let [ data, isDone ] = await scrap_company(browser, company);
// clean up
await close_browser( browser );


console.log(data);
if (data) {
    await store.push(data);
    checklist.check(company);
    console.log('checked');
}

