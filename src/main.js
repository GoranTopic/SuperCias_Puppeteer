import init from './init.js';
import setup_browser from './scripts/setup_browser.js';
import goto_page from './scripts/goto_page.js';
import scrap_suggestions from './scripts/scrap_suggestion.js'
import close_browser from './scripts/close_browser.js';
import click_nombre_radio from './scripts/click_nombre_radio.js';
import { search_page } from './urls.js';

// initilize
let { store, suggestions, proxies } = await init();

// get next values
let sugg = suggestions.next();
let proxy = proxies.next();

console.log('sugg:', sugg);
console.log('proxy:', proxy);

// set up browser
let browser = await setup_browser(proxy);

// go to url
await goto_page( browser, search_page );

// click on nombre radio button
await click_nombre_radio( browser );

while( sugg ) {
    // scrap suggestion
    let data = await scrap_suggestions( browser, sugg );
    console.log('data:', data);
    console.log('length:', data.length);
    // save data and check
    if( data.length ){
        data.forEach( async s => await store.push(s) );
        suggestions.check(sugg, data.length > 5);
        console.log('checked');
    }
    // get next cedula
    sugg = suggestions.next();
}

// clean up
await close_browser( browser );
await store.close();
