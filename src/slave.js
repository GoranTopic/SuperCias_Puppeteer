import slavery from 'slavery.js';
import setup_browser from './scripts/setup_browser.js';
import goto_page from './scripts/goto_page.js';
import scrap_cedula_suggestion from './scripts/scrap_cedula_suggestion.js'
import close_browser from './scripts/close_browser.js';

let url = 'https://appscvs1.supercias.gob.ec/consultaPersona/consulta_cia_param.zul'

slavery({
    numberOfSlaves: 1,
    port: 3003, 
}).slave( {
    'setup': async (proxy, slave) => {
        let browser = slave.get('browser');
        if( browser ) { // if browser we have a browser
            // close
            await close_browser( slave.get('browser') );
        }
        // setup new browser
        browser = await setup_browser(proxy);
        // save the browser in the slave
        slave.set('browser', browser);
    }
    // scrap the cedula
    'default': async (cedula, salve) => {
        // go to url
        await goto_page( browser, url );
        // scrap cedula
        let data = await scrap_cedula_suggestion( browser, cedula );
        // return results
        return { cedula, data };
    }, 

});
