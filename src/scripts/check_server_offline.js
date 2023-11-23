import getText from '../utils/getText.js';

/* check if the string is offline */
const check_if_server_is_offline = async browser => {
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
        //throw new Error('Service Unavailable:' + error_msg );
        return true; // it is offline
    }
    return false; // it is not offline
}