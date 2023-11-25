import puppeteer from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import options from '../options.json' assert { type: 'json' };
import {  createRecognizer } from '../captcha/recognizeNumberCaptchan.js';

const setup_browser = async proxy => {
	console.log('using proxy: ', proxy );
	 // set new proxy, while keeping args
	 if(proxy) options.browser.args = [
        `--proxy-server=http://${ proxy }`,
        ...options.browser.args
    ];
	// create new browser
	const browser = await puppeteer.launch({ ...options.browser });
	// create recognizer
	await createRecognizer();
	// return browser
	return browser;
}

export default setup_browser;
