import Checklist from 'checklist-js';
import insert_custom_components from '../../reverse_engineer/insert_custom_components.js';
// import scripts
import check_server_offline from './check_server_offline.js';
import goto_company_search_page from './goto_company_search_page.js';
import select_company_script from './menus_items/select_company_script.js';
import scrap_informacion_general_script from './menus_items/scrap_informacion_general.js';
import scrap_administradores_actuales from './menus_items/scrap_administradores_actuales.js';
import scrap_documents_script from './menus_items/scrap_documents.js';
import waitForNetworkIdle from '../utils/waitForNetworkIdle.js';

const scrap_company = async (browser, company) => {
    console.log('scraping company: ', company);

    // get page
    let page = (await browser.pages())[0];

    // go to the company search page
    await goto_company_search_page(browser);

    // check if server is ofline
    if( await check_server_offline(browser) ) throw new Error('server is offline');

    // insert custom ajax, functions, jsonfn and eventListeners
    page = await insert_custom_components(page);

    // selecting company
    page = await select_company_script(page, company);

    // wait for table to load
    await waitForNetworkIdle(page, 1000);
    
    /*--------- company scrap ---------*/
    // now that captachn has been accpeted we can load company page

    // insert custom ajax, functions, jsonfn and eventListeners
    page = await insert_custom_components(page);

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
        Object.keys(tab_menus).filter(k => tab_menus[k]), {
        name: `checklist for ${company.name}`,
        path: './storage/checklists',
    })

    let data = { name : company.name, id : company.id, ruc: company.ruc, };
    // for every menu, run the associated scrapper if found
    for (let menu of Object.keys(tab_menus)) {
        // if it is not already chekoff
        if (!checklist_company_menu.isChecked(menu) &&
            tab_menus[menu]) { // check if there is a function
            // wait for page to load with timeout of 0
            await waitForNetworkIdle(page, 1000)
            // run the function
            data[menu] = await tab_menus[menu](page, company);
            // if we have not thrown and error
            checklist_company_menu.check(menu)
        }
    }

    return data;
}

export default scrap_company;
