import puppeteer from 'puppeteer-extra';
import { executablePath } from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import goto_company_search_page from '../states/supercia.gov.ec/goto_company_search_page.js'
import close_browser from '../states/supercia.gov.ec/close_browser.js'
import check_server_offline from '../states/supercia.gov.ec/check_server_offline.js'
import waitUntilRequestDone from '../utils/waitForNetworkIdle.js';
import get_company_by_id from '../utils/get_company_by_id.js';
import { write_json, read_json, mkdir, write_binary_file, fileExists } from '../utils/files.js';
import Checklist from '../progress/Checklist.js'
import custom_ajax from '../websites_code/custom_code/custom_ajax.js';
import jsonfn from '../websites_code/custom_code/jsonfn.js';
import custom_functions from '../websites_code/custom_code/custom_functions.js'
import custom_eventListeners from '../websites_code/custom_code/custom_eventListeners.js'
import scrap_informacion_general_script from './subscripts/scrap_informacion_general.js';
import select_company_script from './subscripts/select_company_script.js';
import scrap_documents_script from './subscripts/scrap_documents.js';
import { information_de_companies } from '../urls.js';
import { make_logger } from '../logger.js';
import { terminateRecognizer } from '../utils/recognizeNumberCaptchan.js';
import options from '../options.js';

/**
 * script.
 *
 * @param {} company_id
 * @param {} proxy
 * @param {} log_color
 */
const script = async (company_id, proxy=false, log_color) => { 

    // get company from company id
    let company = get_company_by_id(company_id);
    // make logger
    let prefix = `[${company.name}] `;
    if(proxy) prefix += `[${proxy.split(':')[0]}]`;
    let log = make_logger(
        prefix, true, log_color
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
    //wait class
    //const navigationPromise = page.waitForNavigation({ waitUntil: ['load', 'networkidle2'] });

    try{
        // go to the company search page
        await goto_company_search_page(browser, log);

        // check if server is ofline
        let isOffline = await check_server_offline(browser, log);
        if(isOffline) process.exit(1);

        // wait for good luck
        await waitUntilRequestDone(page, 1000);

        // load custom code
        //await page.evaluate(custom_components);
        //await page.evaluate(custom_createWidget);
        // over write the normal ajax call for tis one
        await page.evaluate(jsonfn);
        await page.evaluate(custom_ajax);
        await page.evaluate(custom_functions);
        await page.evaluate(custom_eventListeners);

        // selecting company
        page = await select_company_script(page, company, log);

        /*--------- company scrap ---------*/
        // now that captachn has been accpeted we can load company page
        let company_url = information_de_companies;

        // wait for page to load
        //await navigationPromise;
        await waitUntilRequestDone(page, 1000);

        // load custom client code for the new page
        await page.evaluate(jsonfn);
        await page.evaluate(custom_ajax);
        await page.evaluate(custom_functions);
        // this is required fot send_query.js
        log("custom code loaded")

        // make user there is companies folder
        let companies_dir = './data/mined/companies';
        mkdir(companies_dir)

        // company diretory 
        let company_dir = companies_dir + "/" + company.name
        mkdir(company_dir)

        // this is a list of all the menu tabs,
        // with their corresponding scraper
        let tab_menus = {
            'Información general': scrap_informacion_general_script,
            'Administradores actuales': null, //scrap_administradores_actuales,
            'Administradores anteriores': null,
            'Actos jurídicos': null,
            'Accionistas': null,
            'Kárdex de accionistas': null,
            'Información anual presentada': null,
            'Consulta de cumplimiento': null,
            'Documentos online': scrap_documents_script, 
            'Valores adeudados': null,
            'Valores pagados': null,
            'Notificaciones generales': null,
        }

        //make checklist of values
        let checklist_company_menu = new Checklist(
            'checklist_menus', // name for how chelist save
            // only make check list of what we have scraping functions for
            Object.keys(tab_menus).filter( k => tab_menus[k] ),
            // path where to make the checklist
            company_dir
        )

        // for every menu, run the associated scrapper if found
        for( let menu of Object.keys(tab_menus) ) {
            // if it is not already chekoff
            if( !checklist_company_menu.isCheckedOff(menu) ){
                // and we have function for it
                if( tab_menus[menu] ){ // check if there is a function
                    // wait for page to load
                    await waitUntilRequestDone(page, 1000);
                    // run the function
                    let outcome = await tab_menus[menu](page, company_dir, log, company);
                    // if outcome successfull, check it off
                    if(outcome){
                        page = outcome;
                        checklist_company_menu.check(menu)
                    }
                }
            }
        }

        // if it is not done
        if(!checklist_company_menu.isDone())
            throw new Error('Did not finish scrap')
    }catch(e){
        console.error(e);
        await close_browser(browser, log);
        await terminateRecognizer();
        throw e
    }
    await close_browser(browser, log);
    await terminateRecognizer();
}

/*
    // testing
await script('704517', '192.177.191.3:3128', 'green');
*/

// run with npm run company $id $proxy $logger_color
// npm run company 704517 23.27.240.236:3128 green
const params = process.argv.slice(2);
let [ company_id, proxy, log_color ] = params;
await script(company_id, proxy, log_color);

//export default script
