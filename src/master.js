import init from './init.js';
import slavery from 'slavery-js';

slavery({
    port: 3003,
}).master( async master => {
    // initilize tools
    let { store, checklist, proxies } = await init();
    // get next values
    let persona = checklist.next();
    while( persona ) {
        // get an idle slave
        let slave = await master.getIdle(); 
        //  check if the slave has done the setup
        let isReady = await slave.is_done('setup');
        let count = slave['count'] ?? 0;
        // if it has not done the initial setup, or has run more than 30 times
        // random number between 7 and 10
        let random = Math.floor(Math.random() * 3) + 7;
        if( !isReady || count >= random ){
            console.log('setting up browser')
            slave.run( proxies.next(), 'setup').catch(e => console.error(e))
            slave['count'] = 0
        }else{
            // scrap cedula
            console.log( 'running slave with ', persona, ' times', slave['count'])
            slave['count']++;
            slave.run(persona)
                .then( data => {
                    store.push(data).then( () => {
                        checklist.check(data.cedula);
                        console.log('data:', data)
                    })
                }).catch(e => console.error(e))
            // get next cedula
            persona = checklist.next();
        }
    }
    // close the store when done =)
    await store.close();
});
