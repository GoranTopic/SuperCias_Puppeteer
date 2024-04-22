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
        // check if browser has been set up
        let isReady = await slave.is_done('setup');
        // keep count 
        let count = slave['count'] ?? 0;
        // get a random value between 30 and 60
        let random = Math.floor(Math.random() * 30) + 30;
        if( !isReady || count >= random ) {
            console.log('setting up browser');
            slave.run(proxies.next(), 'setup').catch(e => console.error(e));
            slave['count'] = 0;
        }else{
            // run slave scrap
            if( !slave['count'] ) slave['count'] = 0;
            // scrap cedula
            console.log( 'scraptting ', persona );
            slave['count']++;
            slave.run(persona)
                .then( async ({ data, persona }) => {
                    await store.push(data)
                    checklist.check(persona);
                    console.log('data:', data, ' checked');
                    console.log('checked, missing: ', checklist.missingLeft());
                })
            // get next cedula
            persona = checklist.next();
        }
    }
    // close the store when done =)
    await store.close();
});
