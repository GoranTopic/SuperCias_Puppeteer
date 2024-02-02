import { read_json, mkdir } from 'files-js';
import Checklist from 'checklist-js';
import Storage from 'storing-me'
import ProxyRotator from 'proxy-rotator-js'
import options from './options.json' assert { type: 'json' };
import Slavery from 'slavery-js';

Slavery({
    host: 'localhost',
    port: 3000,
}).master(async master => {
    // master is a slave object
    let storage = new Storage({
        type: 'json',
        keyValue: true,
        path: options.data_path, // default: ./storage/
    });
    let store = await storage.open('supercias')
    // make sure the files path exists
    mkdir(options.files_path);
    // proxies
    let proxies = new ProxyRotator('./storage/proxies/proxyscrape_premium_http_proxies.txt')
    // Read the file
    let company_ids = read_json('./storage/ids/company_ids.json')
    // make checklist
    let checklist = new Checklist(company_ids, {
        name: 'company_ids',
        path: './storage/checklists',
        //recalc_on_check: false,
    });
    // get next company
    let company = checklist.next();
    while (company) {
        // get idle slave
        let slave = await master.getIdle()
        slave
            //.timeout(1000 * 60 * 10) // 10 minutes
            .run({ company, proxy: proxies.next() })
            .then(async ({ company, proxy, data }) => {
                await store.push(company.ruc, { data, timestamp: Date.now() });
                //console.log(data);
                checklist.check(company);
                console.log(`[${company.ruc}][${proxy}] ${company.name} checked! ${company_ids.length}/${checklist.missingLeft()}`);
            }).catch(error => {
                console.log(error);
            });
        // get next company
        company = checklist.next();
    }
});
