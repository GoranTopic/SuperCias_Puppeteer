import init from './init.js';
import slavery from 'slavery.js';

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
        let count = slave['count'];
        // if it has not done the initial setup, or has run more than 30 times
        // run the setup function
        if( !isReady || count >= 30 ){
            console.log('setting up broweser')
            slave.run( proxies.next(), 'setup')
            slave['count'] = 0
        }else{
            // scrap cedula
            console.log('running slave with ', cedula, ' times', slave['count'])
            slave['count']++;
            slave.run(cedula)
                .then( async ({ cedula, data }) => {
                    console.log('got data from slave')
                    console.log('cedula:', cedula)
                    console.log('data:', data)
                    if(data){
                        await store.push(data);
                        checklist.check(cedula);
                        console.log('checked')
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
