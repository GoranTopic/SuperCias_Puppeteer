import { ProxyRotator } from '../proxies.js'
import PromiseEngine from '../PromiseEngine.js';
import { read_json, mkdir } from '../utils/files.js';
import { Checklist, DiskList } from '../progress.js';
import options from '../options.js'
import makeLogger from '../logger.js'
import script from './script.js'

// options of browser
let browserOptions = options.browser;
// is debugging
let debugging = options.debugging;
// use proxies
let withProxy = options.proxyRotation;
// number of concorrent browsers
let concurrent = options.concurrent_processes;
// minutes until timeout , can be null
let minutesToTimeout = options.minutesToTimeout

async function main(){
    let engine = new PromiseEngine(concurrent);
    let proxy_r = new ProxyRotator();
    let ids = read_json('./data/mined/ids/company_ids.json')
    let checklist = new Checklist('companies', ids);
    let errored = new DiskList('errored_companies');
    let retries_max = options.triesWithProxies;

    mkdir('./data/resources/checklists/')
		
    // set timeout 1000ms * 60s * minutesToTimeout 
    // don't use the timeout from the promise engine, 
    // it make handeling with the timeout error so musch complicated
    //if(minutesToTimeout) engine.setTimeout( 1000 * 60 * minutesToTimeout );
    // use this.

    // create timeout process
    const create_promise = ( id, proxy, log, retries = 0 ) =>
        new Promise( async (resolve, reject) => {
            try{ // run the script
                log(`Scraping ${id.name}`)
                log(`Company ${checklist.values.length - checklist.missingLeft()} out of ${checklist.values.length}`);
                await script(id, proxy, log)? resolve() : 
                    reject(new Error(`Could not finish scraping ${id.companies}`))
            }catch(e){
                console.error(e);
                reject(e);
            }
        })

// create timeout process
const create_callback = ( id, proxy, log, retries = 0) =>
    result =>  {
        debugging && log("Callback Called");
        debugger;
        // if there was an error
        if(result instanceof Error || result?.error){ 
            // set proxy dead
            proxy && proxy_r.setDead(proxy);
            // stop trying if many tries
            if( retries > retries_max ) {
                errored.add(id);
                //throw new Error('Process rejected');
            }else{ // let's try it again 
                debugging && log("new Promised issued")
                debugger
                return create_promise(id, proxy_r.next(), log, retries+1);
            }
        }else{ // proxy was successfull
            checklist.check(id);
            log(`${id.name} checked off`);
            debugger;
        }
    }

		// set promise next function
		engine.setNextPromise( () => {
				let id = JSON.parse(checklist.nextMissing());
				let proxy = proxy_r.next();
				let logger = makeLogger( withProxy? `[${proxy.proxy.split(':')[0]}]` : "", true);
				let promise = create_promise( id, proxy, logger );
				let callback = create_callback( id, proxy, logger );
				return [ promise, callback ];
		});

		//set stop function
		engine.setStopFunction( () => {
				if(proxy_r.getAliveList().length === 0) return true
				else return false
		})

		// when fuffiled
		engine.whenFulfilled( result => {
				result && result.log(`Fuffiled: ${result.name}`) 
				debugger;
		})

		// when rejected
		engine.whenRejected( result => {
				// can return object without the log function
				result && result.log && result.log(`Rejected: ${result.name} with ${result.error}`) 
				debugger;
		})
		
		//engine.whenResolved(isResolved_callback);
		await engine.start() // done message
				.then(() => console.log("Engine done"))
}

main();
 
export default main
