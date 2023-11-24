import puppeteer from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import check_server_offline from './check_server_offline.js';
import goto_company_search_page from './goto_company_search_page.js';
import close_browser from './close_browser.js';

import scrap_informacion_general_script from './menus_items/scrap_informacion_general.js';
import select_company_script from './menus_items/select_company_script.js';
import scrap_documents_script from './menus_items/scrap_documents.js';

import { terminateRecognizer } from '../captcha/recognizeNumberCaptchan.js';

const scrap_company = async ({ company, proxy = false }) => {
    // options of browser
    let browserOptions = {
        "headless": false,
        "slowMo": 1,
        "devtools": false,
        "excludeSwitches": "enable-automation",
        "args": [
            "--no-sandbox",
            "--disable-web-security",
            "--disable-setuid-sandbox",
            "--allow-file-access-from-files"
        ]
    }


    // create new browser
    const browser = await puppeteer.launch(browserOptions)

    // get page
    let page = (await browser.pages())[0];

    // go to the company search page
    await goto_company_search_page(browser);

    // check if server is ofline
    if( await check_server_offline(browser) ) throw new Error('server is offline');

    // wait for good luck
    await waitUntilRequestDone(page, 1500);

    // insert custom ajax, functions, jsonfn and eventListeners
    page = await insert_custom_components(page);

    // selecting company
    page = await select_company_script(page, company);

    /*--------- company scrap ---------*/
    // now that captachn has been accpeted we can load company page

    // wait for page to load
    await waitUntilRequestDone(page, 1500);
    // insert custom ajax, functions, jsonfn and eventListeners
    page = await insert_custom_components(page);

    // this is a list of all the menu tabs,
    // with their corresponding scraper
    let tab_menus = {
        'Información general': null, //scrap_informacion_general_script,
        'Administradores actuales': null, //scrap_administradores_actuales,
        'Administradores anteriores': null,
        'Actos jurídicos': null,
        'Accionistas': null,
        'Kárdex de accionistas': null,
        'Información anual presentada': null,
        'Consulta de cumplimiento': null,
        'Documentos online': null, //scrap_documents_script,
        'Valores adeudados': null,
        'Valores pagados': null,
        'Notificaciones generales': null,
    }

    //make checklist of values
    let checklist_company_menu = new Checklist(
        Object.keys(tab_menus).filter(k => tab_menus[k]), {
        name: `checklist for ${company.name}`
    }
    )

    // for every menu, run the associated scrapper if found
    for (let menu of Object.keys(tab_menus)) {
        // if it is not already chekoff
        if (!checklist_company_menu.isCheckedOff(menu) &&
            tab_menus[menu]) { // check if there is a function
            // wait for page to load
            await waitUntilRequestDone(page, 1000);
            // run the function
            await tab_menus[menu](page, company);
            // if we have not thrown and error
            checklist_company_menu.check(menu)
        }
    }
    await close_browser(browser);
    await terminateRecognizer();
}

export default scrap_company;
