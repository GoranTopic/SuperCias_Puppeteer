import { busqueda_de_companias_url } from '../../url.js'

// script to handle the home page
const goto_page_script = async browser => {
    // get page
    let page = (await browser.pages())[0];
    //se user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
    // go to page
    await page.goto(busqueda_de_companias_url, {
        waitUntil: 'networkidle0',
    });
    // wait for page to load
    await waitUntilRequestDone(page, 500)
}

export default goto_page_script;
