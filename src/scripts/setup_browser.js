import puppeteer from 'puppeteer';
import { browser_options as options } from '../options.js'

const setup_browser = async proxy => {
	 // set new proxy, while keeping args
	 if(proxy) options.browser.args = [
        `--proxy-server=http://${ proxy }`,
        ...options.browser.args
    ];
	// create new browser
	const browser = await puppeteer.launch({ ...options.browser });
	// return browser
	return browser;
}

export default setup_browser;
