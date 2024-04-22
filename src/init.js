/* this script initlizes the necesary value to start scrapping */
import {  mkdir } from 'files-js';
import ProxyRotator from 'proxy-rotator-js'
import Checklist from 'checklist-js';
import Storage from 'dstore-js';


const init = async () => {
    // get a lsit of cedulas from mongodb
    let storage_cedulas = new Storage({
        type: 'mongodb',
        url: 'mongodb://0.0.0.0:27017',
        database: 'supercias',
    });
    let suggestions_store = await storage_cedulas.open('consulta_personal_suggestion_01');
    // get suggestions
    let cedulas_to_scrap = await suggestions_store.get({});
    console.log('cedulas to scrap', cedulas_to_scrap);
    // close the store
    await suggestions_store.close();
    // make checklist dir
    mkdir('./storage/checklists');
    // Read the file
    let checklist = new Checklist(
        cedulas_to_scrap, { 
            name: 'cedulas_suggestions_01',
            path: './storage/checklists',
            recalc_on_check: false,
            save_every_check: 1,           
        });
    // create a proxy rotator
    let proxies = new ProxyRotator('./storage/proxies/proxyscrape_premium_http_proxies.txt', {
        shuffle: true,
    });
    // make data store
    let storage = new Storage({
        type: 'mongodb',
        url: 'mongodb://0.0.0.0:27017',
        database: 'supercias',
    });
    let store = await storage.open('consultas_personal')
    // return values
    return {
        checklist,
        store,
        proxies,
    }
}

export default init;

