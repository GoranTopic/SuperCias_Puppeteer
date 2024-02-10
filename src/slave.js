import setup_browser from './scripts/setup_browser.js';
import goto_company_search from './scripts/goto_company_search_page.js';
import query_company_by_ruc from './scripts/query_company_by_ruc.js';
import click_ruc_radio from './scripts/click_ruc_radio.js';
import close_browser from './scripts/close_browser.js';
import slavery from 'slavery-js';

slavery({
    numberOfSlaves: 10,
    port: 3003, 
    host: 'localhost', 
}).slave( {
    'setup browser': async (proxy, slave) => {
        // setup browser
        let browser = await setup_browser(proxy);
        // set up browser
        browser = await setup_browser();//proxy);
        // go to company search
        await goto_company_search( browser );
        // click on ruc radio
        await click_ruc_radio( browser );
        // save the browser in the slave
        slave.set('browser', browser);
        // set the proxy in the slave
        slave.set('proxy', proxy);
    },
    'default': async (ruc, slave) => {
        // get setup from slave
        let browser = slave.get('browser');
        let proxy = slave.get('proxy');
        console.log(`[${proxy}][${ruc}] scraping...`);
        // query company by ruc
        let company_ids = await query_company_by_ruc( browser, ruc );
        console.log(`[${proxy}][${ruc}] company_ids: ${company_ids}`);
        // return the result
        return ({ ruc, company_ids });
    }, 
    'clean up': async slave => {
        let browser = slave.get('browser');
        // close browser
        await close_browser( browser );
        slave.set('setup', null);
    }
})
