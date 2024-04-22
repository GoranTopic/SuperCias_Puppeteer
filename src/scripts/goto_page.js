
// script to go to the company search page
const goto_page = async (browser, url) => {
    // get page
    let page = (await browser.pages())[0];
    //se user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
    // go to page with timeout
    await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 0,
    });
    
}

export default goto_page
