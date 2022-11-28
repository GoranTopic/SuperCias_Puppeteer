import { make_logger } from '../logger.js';
import get_company_by_id from '../utils/get_company_by_id.js';
import puppeteer from 'puppeteer-extra';
import { executablePath } from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import close_browser from '../states/supercia.gov.ec/close_browser.js'
import options from '../options.js';


/**
 * script. 
 * this is test scrip that for a random amount of time 
 * and may or may not throw an error
 *
 * @param {} company_id
 * @param {} proxy
 * @param {} log_color
 */
const script = async (company_id, proxy, log_color) => { 

    // get company from company id
    let company = get_company_by_id(company_id);
    // make logger
    let log = make_logger(
        proxy? `[${proxy.split(':')[0]}]`: "", 
        true,
        log_color
    );
    
    // set debugging
    let debugging = options.debugging;
    // options of browser
    let browserOptions = { 
        ...options.browser,
        executablePath: executablePath(),
    }
    // set new proxy, while keeping args
    if(proxy) browserOptions.args = [
        `--proxy-server=${ proxy }`, 
        '--no-sandbox',
        '--disable-setuid-sandbox',
        ...browserOptions.args
    ];

    // add stealth plugin and use defaults (all evasion techniques)
    puppeteer.use(StealthPlugin())

    log(`scrapping ${company.name} through ${proxy}`)
    // create new browser
    const browser = await puppeteer.launch(browserOptions)

    // get page
    let page = ( await browser.pages() )[0];

    try{
        let isError = await new Promise( resolve => {
            setTimeout( // Returns a random integer from 0 to 10 is less than 5:
                () => resolve((Math.floor(Math.random() * 11) < 2 )), 
                100 * (Math.floor(Math.random() * 11) * 30) 
            );
        });

        if(isError)
            throw new Error('it is an Error');
        else
            log('reached the end of the script');
        
    }catch(e){
        console.error(e);
        throw e
    }
    await close_browser(browser, log);
}

// run with npm company $id $proxy $logger_color
const params = process.argv.slice(2);
let [ company_id, proxy, log_color ] = params;
await script(company_id, proxy, log_color);

