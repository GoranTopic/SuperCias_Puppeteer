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

// get cedula
let cedula = checklist.next();

// set up browser
let browser = await setup_browser( proxy );

// go to url
await goto_page( browser, search_page );

console.log('scraping cedula:', cedula);
// scrap cedula
await select_cedula( browser, cedula.cedula );

// set up custom functions
await set_functions( browser );

// scrap cedula
let data = await scrap_cedula( browser );
// add cedula y nombre

console.log('data:', data);
// save data and check
if (data) {
    await store.push({ ...data, cedula: cedula.cedula, nombre: cedula.nombre })
    checklist.check(cedula);
    console.log('checked');
}
// get next cedula
//cedula = checklist.next();
//}

// clean up
await close_browser( browser );
await store.close();

