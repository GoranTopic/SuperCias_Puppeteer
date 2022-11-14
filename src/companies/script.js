import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import goto_company_search_page from '../states/supercia.gov.ec/goto_company_search_page.js'
import close_browser from '../states/supercia.gov.ec/close_browser.js'
import check_server_offline from '../states/supercia.gov.ec/check_server_offline.js'
import waitUntilRequestDone from '../utils/waitForNetworkIdle.js';
import { write_json, read_json, mkdir, write_binary_file, fileExists } from '../utils/files.js';
import { Checklist, DiskList } from '../progress.js';
import custom_ajax from '../websites_code/custom_code/custom_ajax.js';
import jsonfn from '../websites_code/custom_code/jsonfn.js';
import custom_functions from '../websites_code/custom_code/custom_functions.js'
import custom_eventListeners from '../websites_code/custom_code/custom_eventListeners.js'
import scrap_informacion_general_script from './scrapers/scrap_informacion_general.js';
import scrap_documents_script from './scrapers/scrap_documents.js';
import select_company_script from './scrapers/select_company_script.js';
import { information_de_companies } from '../urls.js';
import options from '../options.js';

/**
 * script.
 *
 * @param {} company
 * @param {} proxy
 * @param {} log
 */
const script = async (company, proxy, log=console.log) => { 

    // set debugging
    let debugging = options.debugging;
    // options of browser
    let browserOptions = options.browser;
    // set new proxy, while keeping args
    if(proxy) browserOptions.args = [
        `--proxy-server=${ proxy.proxy }`,
        ...browserOptions.args
    ];

    // add stealth plugin and use defaults (all evasion techniques)
    puppeteer.use(StealthPlugin())

    // create new browser
    const browser = await puppeteer.launch(browserOptions)

    // get page
    let page = ( await browser.pages() )[0];
    //wait class
    const navigationPromise = page.waitForNavigation({ waitUntil: ['load', 'networkidle2'] });

    try{
        // go to the company search page
        await goto_company_search_page(browser, log);

        // check if server is ofline
        await check_server_offline(browser, log);

        // wait for good luck
        await page.waitForTimeout(1000);

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
        await navigationPromise;
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
            'chkls_menus' + company.name, // name for how chelist save
            // only make check list of what we have scraping functions for
            Object.keys(tab_menus).filter( k => tab_menus[k] )
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

        await close_browser(page, log);
        if(checklist_company_menu.isDone())
            return true;
        else
            return false;

    }catch(e){
        console.error(e);
        await close_browser(page, log);
       return false;
    }
}

export default script

/* testing 
import { ProxyRotator } from '../proxies.js'
import makeLogger from '../logger.js'

let proxy_r = new ProxyRotator();
let proxy = proxy_r.next();
// dummy log
let logger = makeLogger(`[${proxy.proxy}] `);
//let log = console.log
// dummy company
let company = { 
    id: '64500',
    ruc:'1792287413001',
    name: 'CORPORACION GRUPO FYBECA S.A. GPF'
};

script(company, proxy, logger);
*/

