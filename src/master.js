import read_rucs from './utils/filter_companies_rucs.js';
import ProxyRotator from 'proxy-rotator-js';
import Checklist from 'checklist-js';
import Storage from 'storing-me';
import slavery from 'slavery-js';

slavery({
    port: 3003, 
    host: 'localhost', 
}).master( async master => { 
    // make storage
    let storage = new Storage({
        type: 'mongodb',
        url: 'mongodb://0.0.0.0:27017/',
        database: 'supercias',
    });
    let store = await storage.open('companies_ids');
    // make rucs checklist
    let rucs = await read_rucs('./storage/rucs/rucs.csv')
    let checklist = new Checklist( rucs, {
        path: './storage/checklists',
        recalc_on_check: false,
        save_every_check: 1000, // otherwise it will take too long to check every one of them 
    });
    // make proxies
    let proxies = new ProxyRotator('./storage/proxies/proxyscrape_premium_http_proxies.txt');
    // get ruc and proxy
    let proxy = proxies.next();
    let ruc = checklist.next();
    // start loop
    while( ruc ) {
        // get idle slave
        let slave = await master.getIdle(); 
        //  check if the salve has done the setup
        if ( await slave.is_done('setup browser') === false ) 
            // setup browser
            slave.run( proxies.next(), 'setup browser' )
        else // scrape the ruc
            slave.run( ruc )
                .then( ({ ruc, company_ids }) => {
                    console.log(`[master][${ruc}]`, company_ids);
                    // just in case we have more than one
                    company_ids.forEach( async company => 
                        await store.push(company)
                    );
                    // check
                    checklist.check(ruc);
                })
        // get next ruc
        ruc = checklist.next();
    }
})
