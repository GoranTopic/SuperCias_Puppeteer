import init from './init.js';
import slavery from 'slavery-js';

slavery({
    port: 3003,
}).master( async master => {
    // initilize tools
    let { store, checklist, proxies } = await init();
    // get next values
    let persona = checklist.next();
    console.log('persona:', persona);
    // while loop
    while( persona ) {
        // get an idle slave
        let slave = await master.getIdle(); 
        // check if browser has been set up
        let isReady = await slave.is_done('setup');
        // keep count 
        let count = slave['count'] ?? 0;
        // get a random value between 30 and 60
        let random = Math.floor(Math.random() * 30) + 30;
        if( !isReady || count >= random ) {
            console.log('setting up browser');
            slave // set up browser
                .run(proxies.next(), 'setup')
                .catch(e => console.error(e));
            slave['count'] = 0;
        }else{
            // run slave scrap
            if( !slave['count'] ) slave['count'] = 0;
            // scrap cedula
            console.log('scraptting ', persona.cedula, persona.nombre);
            slave['count']++;
            slave // run slave
                .run(persona)
                .then( async ({ data, persona }) => {
                    console.log('data:', data, ' checked');
                    await store.push(data)
                    checklist.check(persona);
                    console.log('checked, missing: ', checklist.missingLeft());
                })
                .catch( async e => {
                    slave // set up browser
                        .run(proxies.next(), 'setup')
                        .catch(e => console.error(e));
                });
            // get next cedula
            persona = checklist.next();
        }
    }
    // close the store when done =)
    await store.close();
});
