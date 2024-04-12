import init from './init.js';
import slavery from 'slavery-js';

slavery({
    port: 3003,
}).master( async master => {
    // initilize tools
    let cedula_prefix = '01'
    let { store, checklist, proxies } = await init(cedula_prefix);
    // get next values
    let cedula = checklist.next();
    while( cedula ) {
        // get an idle slave
        let slave = await master.getIdle(); 
        //  check if the slave has done the setup
        let isReady = await slave.is_done('setup');
        let count = slave['count'] ?? 0;
        // if it has not done the initial setup, or has run more than 30 times
        // run the setup function
        console.log('isReady:', isReady, 'count:', count)
        if( !isReady || count >= 10 ){
            console.log('setting up broweser')
            slave.run( proxies.next(), 'setup')
            slave['count'] = 0
        }else{
            // scrap cedula
            console.log( 'running slave with ', cedula, ' times', slave['count'])
            slave['count']++;
            slave.run(cedula)
                .then( async data => {
                    console.log('data:', data)
                    if(data){
                        await store.push(data);
                        checklist.check(data.cedula);
                    }
                }
                ).catch(e => console.error(e))
            // get next cedula
            cedula = checklist.next();
        }
    }
    // close the store when done =)
    await store.close();
});
