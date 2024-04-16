/* this script initlizes the necesary value to start scrapping */
import {  mkdir } from 'files-js';
import ProxyRotator from 'proxy-rotator-js'
import Checklist from 'checklist-js';
import Storage from 'dstore-js';


const init = async (cedula_prefix) => {
    // get a lsit of cedulas from mongodb
    let storage_cedulas = new Storage({
        type: 'mongodb',
        url: 'mongodb://0.0.0.0:27017',
        database: 'Registro-Civil',
    });
    let cedulas_store = await storage_cedulas.open('cedulas')
    // get all the cedulas that start with prefix
    let cedulas_to_scrap = await cedulas_store
        .get({ cedula: { $regex: `^${cedula_prefix}` } })
    // get only the cedula value
    cedulas_to_scrap = cedulas_to_scrap
        .map(cedula => { return cedula.cedula  })
    console.log(`cedulas with prefix ${cedula_prefix}: ${cedulas_to_scrap.length}`)
    await cedulas_store.close()
    // make checklist dir
    mkdir('./storage/checklists');
    // Read the file
    let checklist = new Checklist(
        cedulas_to_scrap,
        {
            name: `cedulas_${cedula_prefix}`,
            path: './storage/checklists',
            recalc_on_check: false,
        });
    // create a proxy rotator
    let proxies = new ProxyRotator('./storage/proxies/proxyscrape_premium_http_proxies.txt');
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

