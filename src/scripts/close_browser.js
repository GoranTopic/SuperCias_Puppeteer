// recognize captcha
import { terminateRecognizer } from '../captcha/recognizeNumberCaptchan.js';

const close_browser_script = async browser => {
	try {
		// close browser
		await browser.close();
		// terminate recognizer
		await terminateRecognizer();
	} catch (error) {
		console.log(error);
	}
}

export default close_browser_script;
