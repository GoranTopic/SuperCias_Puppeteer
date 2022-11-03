import goto_company_search_page from '../../states/supercia.gov.ec/goto_company_search_page.js'
import { information_de_companies } from '../../urls.js';
import check_server_offline from '../../states/supercia.gov.ec/check_server_offline.js'
import waitUntilRequestDone from '../../utils/waitForNetworkIdle.js';
import { write_json, read_json, mkdir, fileExists } from '../../utils/files.js';
import custom_ajax from '../../websites_code/custom_code/custom_ajax.js';
import download_pdf from '../../utils/download_pdf.js';
import scrap_informacion_general from './scrap_informacion_general.js';
import scrap_documents from './scrap_documents.js';
//import scrap_administradores_actuales from './scrap_administradores_actuales.js';
import { Checklist, DiskList } from '../../progress.js';
import puppeteer from 'puppeteer';
import options from '../../options.js';
import send_request from '../../websites_code/send_request.js'
import custom_functions from '../../websites_code/custom_code/custom_functions.js'
import { select_item_parameter } from '../../websites_code/queries/ABParameters.js'
import strToBinary from '../../utils/strToBinary.js';

// set debugging
let debugging = options.debugging;
// options of browser
let browserOptions = options.browser;

// target
let names = read_json('./data/mined/names/company_names.json');
let name = names[3005]; // random name

let proxy = null;
// set new proxy, while keeping args
if(proxy) browserOptions.args = [
    `--proxy-server=${ proxy.proxy }`,
    ...browserOptions.args
];

// dummy log
let log = console.log
// dummy company
let company = { 
    id: '64500',
    ruc:'1792287413001',
    name: 'CORPORACION GRUPO FYBECA S.A. GPF'
};

// create new browser
const browser = await puppeteer.launch(browserOptions)

// get page
let page = ( await browser.pages() )[0];

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
await page.evaluate(custom_ajax);
await page.evaluate(custom_functions);

// make company name
let company_name = company.id + ' - ' + company.ruc + ' - ' + company.name;

// let selecte the company we want to scrap
select_item_parameter.params[0].value = company_name;
let parameters = select_item_parameter;

// let sent the request to select the company and get the captchan
let result = await send_request(
    parameters, // parameters
    (response, status, i, C) => {
        return "return me";
    },
    page,
    log
);

/*--------- company scrap ---------*/
// not thet captachn has been accpeted we can load company page
let company_url = information_de_companies;

// if it is not in the comany url, go there
let current_page = ( await browser.pages() )[0].url()
if( current_page !== company_url )
    await page.goto( company_url, {
        waitUntil: 'networkidle0',
        timeout: 0
    });

// wait for page to load
await waitUntilRequestDone(page, 500);

// load custom client code
await page.evaluate(custom_ajax);
await page.evaluate(custom_functions);
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
    'Información general': scrap_informacion_general,
    'Administradores actuales': null, //scrap_administradores_actuales,
    'Administradores anteriores': null,
    'Actos jurídicos': null,
    'Accionistas': null,
    'Kárdex de accionistas': null,
    'Información anual presentada': null,
    'Consulta de cumplimiento': null,
    'Documentos online': scrap_documents, 
    'Valores adeudados': null,
    'Valores pagados': null,
    'Notificaciones generales': null,
}

//make checklist of values
let checklist_company_menu = new Checklist(
    name + "_menu", // name for how chelist save
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
            let outcome = await tab_menus[menu](page, company_dir, log);
            // if outcome successfull, check it off
            if(outcome) checklist_company_menu.check(menu)
        }
    }
}

console.log('got to then end of script')
