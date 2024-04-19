import slavery from 'slavery-js';
import setup_browser from './scripts/setup_browser.js';
import goto_page from './scripts/goto_page.js';
import scrap_suggestions from './scripts/scrap_suggestion.js'
import close_browser from './scripts/close_browser.js';
import click_nombre_radio from './scripts/click_nombre_radio.js';
import { search_page } from './urls.js';

slavery({
    numberOfSlaves: 1,
    port: 3003, 
}).slave( {
    'setup': async (proxy, slave) => {
        console.log('Setting up slave');
        let browser = slave.get('browser');
        if( browser ) { // if browser we have a browser
            // close
            await close_browser( slave.get('browser') );
        }
        // setup new browser
        browser = await setup_browser(proxy)
        try {
            // go to the url
            await goto_page( browser, search_page );
            // click the radio
            await click_nombre_radio( browser );
            // save the browser in the slave
            slave.set('browser', browser);
        }catch(e){
            // close the browser
            await close_browser( browser );
            // return error
            throw e;
        }
    },
    // scrap the cedula
    'default': async (sugg, salve) => {
        // get the browser
        let browser = salve.get('browser');
        // scrap cedula
        let data = await scrap_suggestions( browser, sugg );
        // return results
        return { sugg, data };
    }, 
});
