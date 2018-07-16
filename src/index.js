const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');


let tidepool = require('./states/tidepool');
let messenger = require('./states/messenger');

puppeteer.launch({
  // headless: false,
  userDataDir: '/tmp/my-profile-directory'
})
.then(async browser => {
  tidepool.browser = browser;
  tidepool.page = await browser.newPage();
  await loadCookies(tidepool.page)
  await tidepool.run();
  await tidepool.login();
  await tidepool.collectStats();
  await saveCookies(tidepool.page)


  messenger.browser = browser;
  messenger.page = await browser.newPage();
  await messenger.run();
  await messenger.login();
  await messenger.sendMessages1()

  // await messenger.page.waitForNavigation();

  await browser.close();
});

const COOKIE_PATH = path.resolve(__dirname, './cookies.txt');
async function loadCookies(page) {
    let cookies = fs.readFileSync(COOKIE_PATH, { encoding: "utf-8" });
    return JSON.parse(cookies)
}

async function saveCookies(page) {
  let cookies = await page.cookies();
  fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies))
}