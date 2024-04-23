import randUserAgent from "rand-user-agent";

// script to go to the company search page
const goto_page = async (browser, url) => {
    // get page
    let page = (await browser.pages())[0];
    //se user agent
    const agent = randUserAgent();
    await page.setUserAgent(agent)
    // go to page with timeout
    await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 0,
    });
    
}

export default goto_page
