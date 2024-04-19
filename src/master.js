import init from './init.js';
import slavery from 'slavery-js';

slavery({
    port: 3003,
}).master( async master => {
    // initilize tools
    let { store, suggestions, proxies } = await init();
    // get next values
    let sugg = suggestions.next();
    // while there are suggestions
    while( sugg ) {
        // get an idle slave
        let slave = await master.getIdle(); 
        //  check if the slave has done the setup
        let isReady = await slave.is_done('setup');
        let count = slave['count'] ?? 0;
        // if it has not done the initial setup, or has run more than 30 times
        // random number between 100 and 200
        let random = Math.floor(Math.random() * (50 - 30 + 1) + 30);
        if( !isReady || count >= random ){
            console.log('setting up broweser')
            slave.run( proxies.next(), 'setup').catch(e => console.error(e))
            slave['count'] = 0
        }else{
            if( !slave['count'] ) slave['count'] = 0;
            // scrap cedula
            console.log( 'running slave with ', sugg, ' times', slave['count'])
            slave['count']++;
            slave.run(sugg)
                .then( ({ data, sugg }) => {
                    data.forEach( async s => await store.push(s) );
                    console.log('data: ', data);
                    suggestions.check(sugg, data.length > 5);
                    console.log('checked');
                }).catch(e => console.error(e))
            // get next cedula
            sugg = suggestions.next();
        }
    }
    // close the store when done =)
    await store.close();
});
