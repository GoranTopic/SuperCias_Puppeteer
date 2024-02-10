// this state queries the companies with given names

/* browser click ruc radio script */
const click_ruc_radio = async browser => {
    // for page to load
    let [ page ] = await browser.pages();

    // get the radion
    let [ radio_el ] = await page.$x('//*[text()="R.U.C."]/..');

    // click on the name radio
    if(radio_el) await radio_el.click();
    else throw new Error('Could not get ruc radio selector element');

    // wait for the page to load
}   

export default click_ruc_radio;
