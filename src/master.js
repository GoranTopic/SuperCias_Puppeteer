import { read_json, mkdir } from 'files-js';
import Checklist from 'checklist-js';
import Storage from 'storing-me'
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
    // Read the file
    let company_ids = read_json('./storage/ids/company_ids.json')
    // make checklist
    let checklist = new Checklist(company_ids, {
        name: 'company_ids',
        path: './storage/checklists',
        recalc_on_check: false,
    });
    // get next company
    let company = checklist.next();
    //while (company) {
        // get idle slave
        let slave = await master.getIdle()
        // send company to slave
        slave.run({ company })
            .then(async data => {
                await store.push(data.ruc, data);
                console.log(data);
                checklist.check({ id: data.id, name: data.name, ruc: data.ruc });
                console.log('checked');
            }).catch(error => {
                console.log(error);
            });
    //}
});