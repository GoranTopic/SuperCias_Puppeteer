import init from './init.js';
import slavery from 'slavery-js';

slavery({
    port: 3003,
}).master( async master => {
    // initilize tools
    let { store, checklist, proxies } = await init();
    // get next values
    let persona = checklist.next();
    // while loop
    while( persona ) {
        // get an idle slave
        let slave = await master.getIdle(); 
        // scrap cedula
        console.log( 'running slave with ', persona );
        slave.run({ persona, proxy: proxies.next() })
            .then( data => {
                store.push(data).then( () => {
                    checklist.check(data.cedula);
                    console.log('data:', data)
                })
            }).catch(e => console.error(e))
        // get next cedula
        persona = checklist.next();
    }
// close the store when done =)
await store.close();
});
