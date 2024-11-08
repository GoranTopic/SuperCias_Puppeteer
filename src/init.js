/* this script initlizes the necesary value to start scrapping */
import { mkdir } from 'files-js';
import ProxyRotator from 'proxy-rotator-js'
import Checklist from 'checklist-js';
import Storage from 'dstore-js';

// vpn
const mongo_url = 'mongodb://10.0.10.5:27017';
//const mongo_url = 'mongodb://0.0.0.0:27017';
const mongo_database = 'supercias';

const makeFileStorage = async () => {
    /* make storage to store pdfs */
    // Create a storage
    let fileStorage = new Storage({
        type: 'mongoFiles',
        url: mongo_url,
        database: mongo_database,
    });
    // Create a file
    let fileStore = await fileStorage.open('kradek_de_accioniestas');
    return fileStore;
}

const makeCompanyStore = async () => {
    /* make a store to store the companies */
    // Create a storage
    let storage = new Storage({
        type: 'mongodb',
        url: mongo_url,
        database: mongo_database,
    });
    // open the store
    let store = await storage.open('kradek_de_accioniestas');
    // return store
    return store;
}

const getRucsToScrap = async () => {
    /* read storage to get the rucs to scrap */
    // Create a storage
    let fileStorage = new Storage({
        type: 'mongodb',
        url: mongo_url,   
        database: mongo_database,
    });
    // open the store
    let suggestions_store = await fileStorage.open('ranking');
    // get the companies that have activos greater then 500k
    let rucs_to_scrap = await suggestions_store.get({
        "activos": { $gt: 500000 }
    })
    // close the store
    await suggestions_store.close();
    // format the rucs to scrap
    rucs_to_scrap = rucs_to_scrap.map( r => ({ "id": r.expediente, "ruc": r.ruc, "name": r.nombre }) );
    return rucs_to_scrap;
}

const makeChecklist = async (rucs_to_scrap) => {
    /* make a checklist with the rucs to scrap */
    mkdir('./storage/checklists');
    // Read the file
    let checklist = new Checklist(
        rucs_to_scrap, {
        name: 'companies_rucs',
        path: './storage/checklists',
        recalc_on_check: false,
        save_every_check: 1,
    });
    // return the checklist
    return checklist;
}

const check_done_recoreds = async (store, checklist) => {
    // get all values from the store
    let companies = await store.get({});
    // for every compnay in the store
    for (let company of companies) {
        // remove the 'Kárdex de accionistas' and '_id' keys
        delete company['Kárdex de accionistas'];
        delete company['_id'];
        // sort keys by id, ruc, name
        company = ({ ...['id', 'ruc', 'name'].reduce((acc, key) => 
            (company[key] ? { ...acc, [key]: company[key] } : acc), {}), ...company });
        // check off the company in the checklist
        checklist.check(company);
        console.log(company.name, 'already in the store');
    }
}
    

const init = async () => {
    // get a lsit of cedulas from mongodb
    let rucs_to_scrap = await getRucsToScrap();
    //console.log('cedulas to scrap:', rucs_to_scrap.length);
    // make a store
    let store = await makeCompanyStore();
    // make checklist dir
    let checklist = await makeChecklist(rucs_to_scrap);   
    // check if the records are already in the store
    let checked = await check_done_recoreds(store, checklist);
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

export { init, makeFileStorage, makeCompanyStore, getRucsToScrap, makeChecklist };
