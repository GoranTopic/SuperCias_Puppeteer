// recognize captcha
import { terminateRecognizer } from '../captcha/recognizeNumberCaptchan.js';

const close_browser_script = async browser => {
	if (!browser) return;
	// closee browser
	await browser.close();
	// terminate recognizer
	await terminateRecognizer();
}

export default close_browser_script;
