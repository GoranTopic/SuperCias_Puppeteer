import setup_browser from './scripts/setup_browser.js';
import scrap_company from './scripts/scrap_company.js';
import close_browser from './scripts/close_browser.js';
import Slaver from 'slavery-js';

Slaver({
    host: 'localhost',
    port: 3000,
    numberOfSlaves: 1,
}).slave({
    'setup': async (proxy, slave) => {
        // set up browser
        slave['browser'] = await setup_browser(proxy);
        return true;
    },
    'scrap': async (company, slave) => {
        // get the browser from the slave
        let browser = slave['browser'];
        // scrap company
        let data = await scrap_company(browser, company);
        // return data
        return ({ company, data });
    },
    'cleanup': async (data, slave) => {
        slave['browser'] = await close_browser(slave['browser']);
        return true;
    }
});

