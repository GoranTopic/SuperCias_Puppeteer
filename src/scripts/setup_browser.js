import dotenv from 'dotenv';
dotenv.config();
import puppeteer from 'puppeteer';
import options from '../options.js';
// get eviroment variables
const { username, password, proxyEndpoint } = process.env;

const setup_browser = async proxy => {
    // set new proxy, while keeping args
    if(proxy) options.browser.args = [
        `--proxy-server=${proxyEndpoint}`,
        //`--proxy-auth=${username}:${password}`,
        //`--proxy-server=http://${ proxy }`,
        ...options.browser.args
    ];

    // create new browser
    const browser = await puppeteer.launch({ ...options.browser });
    // get page
    let page = (await browser.pages())[0];
    // Set the proxy credentials
    await page.authenticate({
        username: username,
        password: password
    });
    // return browser
    return browser;
}

export default setup_browser;
