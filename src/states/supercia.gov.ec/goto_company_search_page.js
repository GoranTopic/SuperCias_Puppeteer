import make_state from '../makeState.js';
import { read_cookies } from '../../utils/cookies.js'
import waitUntilRequestDone from '../../utils/waitForNetworkIdle.js'
import { busqueda_de_companias } from '../../urls.js'
import options from '../../options.js'

// set debugging 
let debugging = options.debugging;

// target 
let target_url = busqueda_de_companias;

// make home page condition
const has_open_tab_and_null_url = async browser =>{ 
    // if it dow not have a page yet, and it is at null url
    let pageNum = await browser.pages()
    let blankURL = ( await browser.pages() )[0]
    return (pageNum.length === 1) && 
        (blankURL.url() === "about:blank" || 
            blankURL.url() === "chrome://new-tab-page/")
}

// script to handle the home page
const goto_page_script = async (browser, log) => {
    // get page
    let page = ( await browser.pages() )[0];
    // read cookies
    await read_cookies(page);
    //se user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
    // go to page
    await page.goto( target_url, {
            waitUntil: 'networkidle0',
            timeout: 0
        });
    // wait for page to load
    await waitUntilRequestDone(page, 500)
}

// make home handle state
export default make_state( 
    has_open_tab_and_null_url,
    goto_page_script,
)
