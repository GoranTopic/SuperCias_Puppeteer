/* this script initlizes the necesary value to start scrapping */
import {  mkdir } from 'files-js';
import ProxyRotator from 'proxy-rotator-js'
import Checklist from 'checklist-js';
import Storage from 'dstore-js';



const makeFileStorage = async () => {
    // Create a storage
    let fileStorage = new Storage({
        type: 'mongoFiles',
        url: 'mongodb://0.0.0.0:27017',
        database: 'supercias_ranking',
    });
    // Create a file
    let fileStore = await fileStorage.open('companies');
    return fileStore;
}


const init = async () => {
    // get a lsit of cedulas from mongodb
    let storage = new Storage({
        type: 'mongodb',
        url: 'mongodb://0.0.0.0:27017',
        database: 'supercias_ranking',
    });
    // open the store
    let suggestions_store = await storage.open('rankings');
    // get suggestions
    let rucs_to_scrap = await suggestions_store.get({
        "activos": { $gt: 500000 }
    })  
    rucs_to_scrap = rucs_to_scrap.map( r => ({ "id": r.expediente, "ruc": r.ruc, "name": r.nombre }) );
    //console.log('cedulas to scrap:', rucs_to_scrap.length);
    // close the store
    await suggestions_store.close();
    // open the store
    let store = await storage.open('companies');
    // make checklist dir
    mkdir('./storage/checklists');
    // Read the file
    let checklist = new Checklist(
        rucs_to_scrap, { 
            name: 'companies_rucs',
            path: './storage/checklists',
            recalc_on_check: false,
            save_every_check: 1,
        });
    // create a proxy rotator
    let proxies = new ProxyRotator('./storage/proxies/proxyscrape_premium_http_proxies.txt', {
        shuffle: true,
    });
    // make fileStore 
    let fileStore = await makeFileStorage();
    // return values
    return {
        checklist,
        fileStore,
        store,
        proxies,
    }
}

export default init;

