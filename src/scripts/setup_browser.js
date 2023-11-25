import puppeteer from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import options from '../options.json' assert { type: 'json' };

const setup_browser = async proxy => {
	console.log('proxy: ', proxy);
	// create new browser
	const browser = await puppeteer.launch(options.browser);
	// return browser
	return browser;
}

export default setup_browser;
