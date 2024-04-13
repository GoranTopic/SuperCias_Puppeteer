import slavery from 'slavery-js';
import setup_browser from './scripts/setup_browser.js';
import goto_page from './scripts/goto_page.js';
import scrap_cedula_suggestion from './scripts/scrap_cedula_suggestion.js'
import close_browser from './scripts/close_browser.js';
import { search_page as url } from './urls.js';

slavery({
    numberOfSlaves: 1,
    host: 'localhost',
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
        // go to the url
        try {
            await goto_page( browser, url );
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
    'default': async (cedula, salve) => {
        console.log(`Scraping cedula: ${cedula}`);
        // get the browser
        let browser = salve.get('browser');
        // scrap cedula
        let data = await scrap_cedula_suggestion( browser, cedula );
        // return results
        return data;
    }, 

});
