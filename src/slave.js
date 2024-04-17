import slavery from 'slavery-js';
import setup_browser from './scripts/setup_browser.js';
import goto_page from './scripts/goto_page.js';
import select_cedula from './scripts/select_cedula.js';
import set_functions from './scripts/set_functions.js';
import scrap_cedula from './scripts/scrap_cedula.js';
import close_browser from './scripts/close_browser.js';
import { search_page } from './urls.js';


slavery({
    numberOfSlaves: 1,
    port: 3003, 
}).slave( {

    'setup': async (proxy, slave) => {
        console.log('Setting up slave with proxy:', proxy);
        let browser = slave.get('browser');
        if( browser ) { // if browser we have a browser
            // close
            await close_browser( browser );
        }
        // setup new browser
        browser = await setup_browser(proxy)
        // go to the url
        try {
            await goto_page( browser, search_page );
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
    'default': async (persona, salve) => {
        console.log('scraping :', persona)
        // get the browser
        let browser = salve.get('browser');
        // scrap cedula
        await select_cedula( browser, persona.cedula );
        // set up custom functions
        await set_functions( browser );
        // scrap cedula
        let data = await scrap_cedula( browser );
        // add cedula y nombre
        data = { ...data, cedula: persona.cedula, nombre: persona.nombre };
        // return results
        return data;
    }, 


});
