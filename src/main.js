import init from './init.js';
import setup_browser from './scripts/setup_browser.js';
import goto_page from './scripts/goto_page.js';
import select_cedula from './scripts/select_cedula.js';
import set_functions from './scripts/set_functions.js';
import scrap_cedula from './scripts/scrap_cedula.js';
import close_browser from './scripts/close_browser.js';
import { search_page } from './urls.js';

let { store, checklist, proxies } = await init();

// get proxy
let proxy = proxies.next();
console.log('using proxy:', proxy);

// get cedula
let persona = checklist.next();

// set up browser
let browser = await setup_browser( proxy );
// count the num of requests with this proxy
let count = 0;

// go to url
await goto_page( browser, search_page );

console.log('scraping :', persona, 'with proxy:', proxy, 'count:', count);
// scrap cedula
await select_cedula( browser, persona);

/*
while(persona) {
    try {
        // check if we need to change proxy
        if( count > 10 ) {
            // get new proxy
            proxy = proxies.next();
            await close_browser( browser );
            // set up browser
            browser = await setup_browser( proxy );
            count = 0;
        }
        // go to url
        await goto_page( browser, search_page );

        console.log('scraping :', persona, 'with proxy:', proxy, 'count:', count);
        // scrap cedula
        await select_cedula( browser, persona);

        // set up custom functions
        await set_functions( browser );

        // scrap cedula
        let data = await scrap_cedula( browser );

        // add cedula y nombre
        data = { ...data, cedula: persona.cedula, nombre: persona.nombre };

        console.log('data:', data);
        // save data and check
        if (data) {
            await store.push(data);
            checklist.check(persona);
            console.log('checked, missing: ', checklist.missingLeft());
        }
        // get next cedula
        persona = checklist.next();
        count++;
    } catch (e) {
        console.log('error:', e);
        await close_browser( browser );
        // set up browser
        browser = await setup_browser( proxies.next() );
        count = 0;
        console.log('retrying');
    }
}

// clean up
await close_browser( browser );
*/

await store.close();

