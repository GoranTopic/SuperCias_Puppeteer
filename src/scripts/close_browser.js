
const close_browser_script = async browser => {
	if (!browser) return;
	// closee browser
	await browser.close();
}

export default close_browser_script;
