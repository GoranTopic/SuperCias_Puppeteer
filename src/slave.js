import slavery from 'slavery-js';
import setup_browser from './scripts/setup_browser.js';
import goto_page from './scripts/goto_page.js';
import select_cedula from './scripts/select_cedula.js';
import set_functions from './scripts/set_functions.js';
import scrap_cedula from './scripts/scrap_cedula.js';
import close_browser from './scripts/close_browser.js';
import { search_page } from './urls.js';

const setup = async (proxy, slave) => {
    // setup browser
    let browser = slave.get('browser');
    // close browser if exists
    if(browser) await close_browser( browser );
    // set up browser
    browser = await setup_browser( proxy );
    // save browser
    slave.set('browser', browser);
}

const scrap_persona = async (persona, slave) => {
    // get broswer
    let browser = slave.get('browser');
    try{
        // go to url
        await goto_page( browser, search_page );
        // scrap cedula
        await select_cedula( browser, persona );
        // set up custom functions
        await set_functions( browser );
        // scrap cedula
        let data = await scrap_cedula( browser );
        // add cedula y nombre
        data = { ...data, 
            cedula: persona.cedula, 
            nombre: persona.nombre, 
        };
        // return data
        return { data, persona };
    }catch(e){
        await close_browser( browser );
        console.log('error:', e);
        throw e;
    }
}

slavery({
    numberOfSlaves: 1,
    port: 3003,
    // 8 minutes
    timeout: 480000, 
}).slave({
    'setup': setup,
    'default': scrap_persona,
});
