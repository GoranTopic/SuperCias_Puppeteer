import read_rucs from './utils/filter_companies_rucs.js';
import setup_browser from './scripts/setup_browser.js';
import goto_company_search from './scripts/goto_company_search_page.js';
import query_company_by_ruc from './scripts/query_company_by_ruc.js';
import click_ruc_radio from './scripts/click_ruc_radio.js';
import close_browser from './scripts/close_browser.js';
//import ProxyRotator from 'proxy-rotator-js'
import Checklist from 'checklist-js';
import Storage from 'storing-me'
import options from './options.json' assert { type: 'json' };
import make_logger from './utils/logger.js';


// get rucs
let rucs = await read_rucs('./storage/rucs/rucs.csv')

// make storage
let storage = new Storage({
        type: 'mongodb',
        url: 'mongodb://0.0.0.0:27017/',
        database: 'supercias',
    });
let store = await storage.open('companies_ids');

// Read the file
let checklist = new Checklist( rucs, {
    path: './storage/checklists',
    recalc_on_check: false,
    save_every_check: 1000, // otherwise it will take too long to check every one of them 
});
// get one ruc
let ruc = checklist.next();

// proxies
//let proxies = new ProxyRotator('./storage/proxies/proxyscrape_premium_http_proxies.txt');
//let proxy = proxies.next();

// make logger
let console = make_logger({ ruc }); //proxy });

// set up browser
let browser = await setup_browser();//proxy);
// go to company search
await goto_company_search( browser, ruc );
// click on ruc radio
await click_ruc_radio( browser );

// while we have rucs
while( ruc ) {
    // make logger
    console = make_logger({ ruc }); //proxy });
    console.log('scraping:', ruc);
    // query company by ruc
    let companies_id = await query_company_by_ruc( browser, ruc );
    console.log('companies_id:', companies_id);
    // just in case we have more than one
    companies_id.forEach( async company => 
        await store.push(company)
    );
    // check
    console.log('checking:', ruc);
    checklist.check(ruc);
    console.log('checked:', ruc);
    // get next ruc
    ruc = checklist.next();
}

// close browser
await close_browser( browser );
