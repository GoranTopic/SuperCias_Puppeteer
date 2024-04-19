/* click on nombre radio button */
const click_nombre_radio = async browser => {
    // get page
    let page = (await browser.pages())[0];
    // get nombre radio button
    const element = await page.$('.z-radiogroup > span:nth-child(2)');
    // click on nombre radio button
    await Promise.all([
        element.click(),
        page.waitForNavigation(), 
    ]);
    // return browser
    return browser;
}


export default click_nombre_radio;
