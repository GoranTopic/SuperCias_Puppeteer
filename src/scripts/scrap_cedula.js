//import insert_custom_components from '../../reverse_engineer/insert_custom_components.js';
// import scripts
//import scrap_documents_script from './menus_items/scrap_documents.js';
//import waitForNetworkIdle from '../utils/waitForNetworkIdle.js';

const scrap_cedula = async (browser, cedula) => {
    // get page
    let page = (await browser.pages())[0];

    // get combobox element
    let  combobox = await page.$('#cedula');

    let w = zk.Widget.$(jq(`#${zk.Widget.getElementsById('comboNombres')[0].id}`))
    w.fire("onChanging", { value: "091657", start:6 }, { ignorable :1, rtags: { onChanging: 1 }}, 5 ); 
    w.fire("onChanging", { value: "091657", start: 6 }, null, 90 )

}

export default scrap_company;
