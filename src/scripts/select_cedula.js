import { consulta_personal } from '../urls.js';

/* this script will take a cedula and return the suggestion of names that match this cedula */
const select_cedula = async (browser, cedula) => {
    //cedula = '0916576796'; // andjelko
    cedula = '0905396180'; // tomislav
    // get page
    let page = (await browser.pages())[0];
    // get input by classes 'z-combobox-inp z-combobox-right-edge'
    let input = await page.$('.z-combobox-inp.z-combobox-right-edge');
    // type the cedula
    await input.type(cedula);
    // wait for suggestion element with class 'z-comboitem-text' to show up
    await page.waitForSelector('.z-comboitem-text', { timeout: 5000 });
    // press enter
    await input.press('Enter');
    // wait for page to redirect
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    // check the url
    let url = page.url();
    if (url !== consulta_personal) {
        throw new Error('The page did not redirect to the correct page');
    }
    // return the page
    return page;
}

export default select_cedula;
