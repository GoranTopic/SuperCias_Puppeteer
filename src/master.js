import Slavery from 'slavery-js';
import init from './init.js';

Slavery({
    host: 'localhost',
    port: 3000,
}).master(async master => {
    // master is a slave object
    const { proxies, store, checklist } = await init();
    // get next company
    let company = checklist.next();
    while (company) {
        // get idle slave
        let slave = await master.getIdle()
        slave
            //.timeout(1000 * 60 * 10) // 10 minutes
            .run({ company, proxy: proxies.next() })
            .then(async ({ company, proxy, data }) => {
                if (data) {
                    // if we get databacl, we push it to the store
                    await store.push(data);
                    //console.log(data);
                    checklist.check(company);
                    console.log(`[${company.ruc}] ${company.name} checked!`);
                    console.log(`Companies checked so far ${checklist.valuesDone()}/${checklist.valuesCount()} `)
                }
            }).catch(error => {
                console.log(error);
            });
        // get next company
        company = checklist.next();
    }
});
