import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
    headless: true,
    args: [
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--no-sandbox",
    ]
});

const page = await browser.newPage();
await page.goto("https://example.com");
const ss = await page.screenshot({path: "./screenshot.png"});

await page.close();
await browser.close();
