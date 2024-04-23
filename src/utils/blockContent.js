
let blk_url = 'https://appscvs1.supercias.gob.ec/consultaPersona/consulta_cia_personas.zul'
// script to go to the company search page
const goto_page = async (browser, url) => {
    // get page
    let page = (await browser.pages())[0];
    // Set request interceptor
    await page.setRequestInterception(true);
    const blockedTypes = new Set(["image", "stylesheet", "font", "media"]);
    page.on('request', async (req) => {
        if (blockedTypes.has(req.resourceType())) {
            req.abort();
        } else if (req.url().includes('google')) {
            req.abort();
        }else if (req.isNavigationRequest() && req.redirectChain().length !== 0) {
            request.abort();
        } else{
            req.continue();
        }
    });
}

export default goto_page
