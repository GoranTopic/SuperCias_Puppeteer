import make_state from '../makeState.js';
import { busqueda_de_companias } from '../../urls.js';
import getText from '../../utils/getText.js';

// condition for entering input name state
const check_server_condition = async browser =>
    // if it dow not have a page yet, and the page is at consulta principal
    ( ( await browser.pages() ).length === 1 &&
        (( await browser.pages() )[0].url() === busqueda_de_companias )
    )

/* check if the string is offline */
const check_if_server_is_offline = async (browser, log) => {
    // for page to load
    let [ page ] = await browser.pages();
    // check if you it has error message
    let [ has_error_msg ] = 
        await page.$x('//td[text()="Servicio no disponible por el momento"]') ||
        await page.$x('//td[text()="Estamos solucionando el problema, por favor intente más tarde."]')

    // if there is an error
    if(has_error_msg){
        // get error message
        let error_msg = await getText(has_error_msg);
        // thow error
        //throw new Error('Service Unavailable:' + error_msg );
        return true; // it is offline
    }
    return false; // it is not offline
}

// make state
export default make_state(
    check_server_condition,
    check_if_server_is_offline
)
