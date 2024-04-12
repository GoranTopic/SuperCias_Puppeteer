import init from './init.js';
import setup_browser from './scripts/setup_browser.js';
import goto_page from './scripts/goto_page.js';
import scrap_cedula_suggestion from './scripts/scrap_cedula_suggestion.js'
import close_browser from './scripts/close_browser.js';

let url = 'https://appscvs1.supercias.gob.ec/consultaPersona/consulta_cia_param.zul'

let cedula_prefix = '01'
let { store, checklist, proxies } = await init(cedula_prefix);

//let proxy = proxies.next();
let cedula = checklist.next();

// set up browser
let browser = await setup_browser(proxy);

// go to url
await goto_page( browser, url );

while( cedula ) {
    // scrap cedula
    let data = await scrap_cedula_suggestion( browser, cedula );
    console.log('data:', data);
    // save data and check
    if (data) {
        await store.push(data);
        checklist.check(cedula);
        console.log('checked');
    }
    // get next cedula
    cedula = checklist.next();
}


// clean up
await close_browser( browser );
await store.close();
