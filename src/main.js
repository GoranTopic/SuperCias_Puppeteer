import setup_browser from './scripts/setup_browser.js';
import scrap_company from './scripts/scrap_company.js';
import close_browser from './scripts/close_browser.js';
import { init } from './init.js';

const { proxies, store, fileStore, checklist } = await init();

let proxy = await proxies.next();
let company = await checklist.next();
console.log('next company', company);

// set up browser
let browser = await setup_browser() //proxy);
console.log(`setting up browser with proxy: ${proxy}`);
// save fileStore in to the page so that it can be used in the browser
(await browser.pages())[0]['fileStore'] = fileStore;
// scrap company
let data = await scrap_company(browser, company);
console.log('scraped company', data);
// clean up
//await close_browser( browser );

/*
if(data) {
    await store.push(data);
    checklist.check(company);
    console.log(`[${company.ruc}][${proxy}] ${company.name} checked!`);
} else {
    console.log(`[${company.ruc}][${proxy}] ${company.name} not checked!`);
}
*/
