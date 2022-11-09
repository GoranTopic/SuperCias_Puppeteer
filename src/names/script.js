import puppeteer from 'puppeteer';
import { DiskList } from '../progress.js';
import options from '../options.js'
import makeLogger from '../logger.js'
import goto_company_search_page from '../states/supercia.gov.ec/goto_company_search_page.js'
import check_server_offline from '../states/supercia.gov.ec/check_server_offline.js'
import close_browser from '../states/supercia.gov.ec/close_browser.js'
import query_suggestions from '../states/supercia.gov.ec/query_suggestions.js'

// options of browser
let browserOptions = options.browser;
// is debugging
let debugging = options.debugging;

async function script( proxy, log ){
    // list where to store the names
    let names = new DiskList('companies_names');
    // tries?
    let retries_max = options.triesWithProxies;
    // set new proxy, while keeping args
    console.log(proxy);
    if(proxy) browserOptions.args = [
        `--proxy-server=${ proxy.proxy }`, 
        ...browserOptions.args 
    ];
    // if the loger is not passed, create one
    if(!log) log = makeLogger( proxy? `[${proxy.proxy}] ` : "" );

    /* start of script */
    // create new browser
    const browser = await puppeteer.launch(browserOptions)
    try{ // cath error
        // go to the company search page
        await goto_company_search_page(browser, log);
        debugger;
        // check if server is ofline
        await check_server_offline(browser, log);
        // make brower query for suggestions
        debugger;
        await query_suggestions(browser, names, log);
        debugger;
    }catch(e){
        // close browser if something went wrond
        await close_browser(browser, log);
        throw e
        return false;
    }
    // close browser
    await close_browser(browser, log);
    // if we succeded
    return true;
}

// if testing script alone
//script();

export default script
