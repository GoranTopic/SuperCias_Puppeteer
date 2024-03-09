import setup_browser from './scripts/setup_browser.js';
import scrap_company from './scripts/scrap_company.js';
import close_browser from './scripts/close_browser.js';
import Slaver from 'slavery-js';
import make_logger from './utils/logger.js';

Slaver({
    host: 'localhost',
    port: 3000,
    numberOfSlaves: 1,
}).slave(async ({ company, proxy }) => {
    let console = make_logger({ ruc: company.ruc, proxy });
    let browser = null;
    let data = null;
    try {
        // set up browser
        console.log('setting up browser');
        browser = await setup_browser(proxy);
        // scrap company
        console.log('scraping company');
        data = await scrap_company(browser, company, console);
    } catch (error) {
        // close browser if something goes wrong
        await close_browser(browser);
        // throw error
        throw error;
    }
    // close browser
    await close_browser(browser);
    // return data
    return ({ company, proxy, data });
});

