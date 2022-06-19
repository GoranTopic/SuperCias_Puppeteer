import { ProxyRotator } from '../../proxies.js'
import PromiseEngine from '../../PromiseEngine.js';
import { read_json } from '../../utils/files.js';
import { Checklist, DiskList } from '../../progress.js';
import goto_company_search_page from '../../states/supercia.gov.ec/goto_company_search_page.js'
import input_company_name from '../../states/supercia.gov.ec/input_company_name.js'
import close_browser from '../../states/supercia.gov.ec/close_browser.js'
import scrap_company from '../../states/supercia.gov.ec/scrap_company.js'
import options from '../../options.js'
import makeLogger from '../../logger.js'
import puppeteer from 'puppeteer';

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
		let names = read_json('./data/mined/names/company_names.json');
		let checklist = new Checklist('companies', names);
		let errored = new DiskList('errored_companies');
		let retries_max = options.triesWithProxies;
		
		// set timeout 1000ms * 60s * minutesToTimeout 
		// don't use the timeout from the promise engine, 
		// it make handeling with the timeout error so musch complicated
		//if(minutesToTimeout) engine.setTimeout( 1000 * 60 * minutesToTimeout );
		// use this. 

		// create timeout process
		const create_promise 	=	( name, proxy, log, retries = 0 ) =>
				new Promise( async (resolve, reject) => {
						if(withProxy) // set new proxy
								browserOptions.args = [ `--proxy-server=${ proxy.proxy }` ];
						// create new browser
						const browser = await puppeteer.launch(browserOptions)
						// retun new promise
						let max_loop = options.triesPerProxy;
						let loops = 0;
						let isDone = false
						while( loops < max_loop ){
								try{
										if(minutesToTimeout) setTimeout(() => 
												reject( { name, proxy, log, error: "Timed out function" } ),
												1000 * 60 * minutesToTimeout 
										)
										// go to the company
										await goto_company_search_page(browser, log);
										// input company name
										await input_company_name(browser, name, log);
										// scrap comany 
										isDone = await scrap_company(browser, name, log);
										// if we successfull scraped comany
										if(isDone){
												// close browser
												await close_browser(browser, log);
												// stop loop
												loops = max_loop;
												log(`${name} is completed.`);
												resolve( { name, proxy, log } )
												return;
										}
								}catch(e){ // something went wrong
										console.error("error:" + e)
								}
								debugging && log("let's try that again");
								debugger;
								loops++;
						}
						await close_browser(browser, log)
						log(`Could not finishd scrapping ${name}`)
						reject( { name, proxy, log, error: "Did not finished company scrap" } )
				}).catch( e =>{
						console.log("it cam out here", e);
						debugger;
						return e;
				})

		// create timeout process
		const create_callback = ( name, proxy, log, retries = 0) =>
				result =>  {
						debugging && log("Callback Called");
						debugger;
						// if there was an error
						if(result?.error || result.message === 'timed out'){ 
								// set proxy dead
								result.proxy && proxy_r.setDead(result.proxy);
								// stop trying if many tries
								if(result.retries && ( result.retries > retries_max )) {
										errored.add(name);
										throw new Error('Process rejected');

								}else{ // let's try it again 
										return create_promise(name, proxy_r.next(), log, retries+1);
								}
						}else{ // proxy was successfull
								checklist.check(name);
								log(`${name} checked off`);
								debugger;
						}
				}

		// set promise next function
		engine.setNextPromise( () => {
				let name = checklist.nextMissing()
				let proxy = proxy_r.next();
				let logger = makeLogger( withProxy? `[${proxy.proxy}] ` : "" );
				let promise = create_promise( name, proxy, logger );
				let callback = create_callback( name, proxy, logger );
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
		await engine.start()
		// done message
				.then(() => console.log("Engine done"))
}

main();
 
export default main
