/* this script initlizes the necesary value to start scrapping */
import {  mkdir } from 'files-js';
import ProxyRotator from 'proxy-rotator-js'
import Checklist from 'checklist-js';
import Storage from 'dstore-js';
const init = async () => {
    // get a lsit of cedulas from mongodb
    let storage = new Storage({
        type: 'mongodb',
        url: 'mongodb://0.0.0.0:27017',
        database: 'supercias',
    });
    //    
    let fileStorage = new Storage({
        type: 'mongoFiles',
        url: 'mongodb://0.0.0.0:27017',
        database: 'supercias',
    });
    // open the store
    let suggestions_store = await storage.open('companies_suggestions');
    // get suggestions
    let cedulas_to_scrap = await suggestions_store.get({});
    console.log('cedulas to scrap', cedulas_to_scrap.length);
    // close the store
    await suggestions_store.close();
    // Create a file
    let fileStore = await fileStorage.open('companies');
    // open the store
    let store = await storage.open('companies');
    // make checklist dir
    mkdir('./storage/checklists');
    // Read the file
    let checklist = new Checklist(
        cedulas_to_scrap, { 
            name: 'companies_suggestions',
            path: './storage/checklists',
            recalc_on_check: false,
            save_every_check: 1,
        });
    // create a proxy rotator
    let proxies = new ProxyRotator('./storage/proxies/proxyscrape_premium_http_proxies.txt', {
        shuffle: true,
    });
    // return values
    return {
        checklist,
        fileStore,
        store,
        proxies,
    }
}

export default init;

