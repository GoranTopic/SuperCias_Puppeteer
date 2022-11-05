import puppeteer from 'puppeteer';
import options from '../../options.js';
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
import send_request from '../../websites_code/send_request.js'
import custom_functions from '../../websites_code/custom_code/custom_functions.js'
import select_autocomplete_company from '../../websites_code/queries/select_autocomplete_suggestion.js'
import str_to_binary from '../../utils/strToBinary.js';
import recognizeCaptchan from '../../utils/recognizeNumberCaptchan.js';
import query_company_captchan from '../../websites_code/queries/query_company_captchan.js';

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

debugger;
// let sent the request to select the company and get the captchan
let captchan_src = await send_request(
    select_autocomplete_company(company), // parameters
    (response, status, i, C) => { 
        // we knwo the server is going to awnser with a captchan
        // let parse the response html send by the server
        let html = window.parse_html_str(response.responseText);
        // get captchan url
        let captchan_src = window.get_captchan_src(html);
        // return captchan src
        console.log("captchan_src:", captchan_src);
        return captchan_src
    },
    page,
    log,
    // followAlong false so that we query the server for captchan only once
    //false,
);

// now let's fetch the url captchan image
let bin_str = await page.evaluate( 
    async ( captchan_src ) => {
        // fetch from browser
        let captchan_img = await window.fetch(captchan_src);
        console.log("captchan_img:", captchan_img);
        // convert to binary image string
        let bin_str = await window.to_binary_string( captchan_img );
        // binary string 
        return bin_str
    }, 
    captchan_src
)

// let convert imgae back to binary
let captchan_bin = str_to_binary(binary_string);
// recognize the bytes image
let captchan_solution = await recognizeCaptchan(captchan_bin);
log("captchan regonized as:", captchan_solution);


// send the capthcan and hope that it is right
let is_captchan_accepted = await page.evaluate(
    async ({ captchan_solution, query_company_captchan }) => {
        // we run everything inside a promise so that we can retun
        // the otucome of the cpatchan
        return await new Promise(( resolve, reject ) => {
            // let's write the captchan in the  
            document.getElementById('frmBusquedaCompanias:captcha').value = captchan_solution;
            // send captachn
            PrimeFaces.ab({
                ...query_company_captchan,
                oncomplete: async (response, status, i, C) => {
                    try { 
                        // parse response
                        let html = window.parse_html_str(response.responseText);
                        // get extesnion
                        let extension = JSON.parse(html.getElementsByTagName('extension')[0].innerText);
                        console.log("extension:", extension);
                        //  check is captchan is corrent
                        let isCaptchanCorrect = extension.captchaCorrecto || extension.procesamientoCorrecto
                        console.log("isCaptchanCorrect:", isCaptchanCorrect)
                        resolve(isCaptchanCorrect);
                        // run load new page
                        handleMostrarPaginaInformacionCompania(response, status, i );
                    }catch{
                        reject(status);
                        return;
                    }
                }
            });
        });
    }, { captchan_solution, query_company_captchan} 
);

debugger;
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
