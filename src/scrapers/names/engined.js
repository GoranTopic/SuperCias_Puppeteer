import { ProxyRotator } from '../../proxies.js'
import PromiseEngine from '../../PromiseEngine.js';
import options from '../../options.js'
import makeLogger from '../../logger.js'
import script from './script.js';

// options of browser
let browserOptions = options.browser;
// is debugging
let debugging = options.debugging;
// use proxies
let withProxy = options.proxyRotation;
console.log(withProxy)
// number of concorrent browsers
let concurrent = options.concurrent_processes;

async function main(){
    let engine = new PromiseEngine(concurrent);
    let proxy_r = new ProxyRotator();

    // create timeout process
    const create_promise = (proxy, log) =>
        new Promise( async (resolve, reject) => {
            // retun new promise
            let isDone = false;
            // try loop
            try{
                // run the script
                isDone = await script(proxy, log);
                // if script succeded
                if(isDone)
                    resolve({ proxy, log, message: "Script Finished", })
            }catch(e){ // something went wrong
                reject({ proxy, log, error: e,
                    message: "Did not finished name scrap",
                })
            }
        })

    // set promise next function
    engine.setNextPromise( () => {
        let proxy = withProxy? proxy_r.next() : null;
        let logger = makeLogger( withProxy? `[${proxy.proxy}] ` : "" );
        let promise = create_promise( proxy, logger );
        return promise ;
    });

    // when fuffiled
    engine.whenFulfilled( (result, stop) => {
        result && result.log(`Fuffiled: ${result.message} at ${new Date()}`)
        stop();
    })

    // when rejected
    engine.whenRejected( (result, stop) => {
        // can return object without the log function
        result && result.log && result.log(`Rejected: ${result.message} at ${new Date()}`) 
        stop();
        // print error
        console.error(result.error)
        // halt execution if server error
        if(result.error?.message?.match(/^Service Unavailable.*/)) stop();
    })

    //engine.whenResolved(isResolved_callback);
    await engine.start()
    // done message
        .then(() => console.log(`Engine done at ${new Date()}`))
}

main();

export default main
