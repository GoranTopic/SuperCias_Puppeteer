import slavery from 'slavery-js';
import setup_browser from './scripts/setup_browser.js';
import goto_page from './scripts/goto_page.js';
import select_cedula from './scripts/select_cedula.js';
import set_functions from './scripts/set_functions.js';
import scrap_cedula from './scripts/scrap_cedula.js';
import close_browser from './scripts/close_browser.js';
import { search_page } from './urls.js';

slavery({
    numberOfSlaves: 20,
    port: 3003,
}).slave( async ({ persona, proxy }, slave) => {
    let browser;
    try{
        // set up browser
        browser = await setup_browser( proxy );
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
            identificacion: persona.cedula, 
            nombre: persona.nombre, 
        };
        // close browser
        await close_browser( browser );
        // return data
        return data;
    }catch(e){
        await close_browser( browser );
        console.log('error:', e);
        throw e;
    }
});
