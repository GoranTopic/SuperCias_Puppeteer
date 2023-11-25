import setup_browser from './scripts/setup_browser.js';
import scrap_company from './scripts/scrap_company.js';
import close_browser from './scripts/close_browser.js';
import Slaver from 'slavery-js';

Slaver({
    host: 'localhost',
    port: 3000,
    numberOfSlaves: 1,
}).slave(async ({ company, proxy }) => {
    // set up browser
    let browser = await setup_browser(proxy);
    // scrap company
    let data = await scrap_company(browser, company);
    // close browser
    await close_browser(browser);
    // return data
    return ({ company, data });
});

