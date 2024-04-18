/* click on nombre radio button */
const click_nombre_radio = async browser => {
    // get page
    let page = (await browser.pages())[0];
    // get nombre radio button
    const elements = await page.$$('.z-radiogroup:nth-child(2) > span');
    // click on nombre radio button
    await Promise.all([
        elements[1].click(),
        page.waitForNavigation(), 
    ]);
    // return browser
    return browser;
}


export default click_nombre_radio;
