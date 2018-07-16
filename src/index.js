const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const sleep = require('sleep');

let login = require('./secrets').tidepool;

var StateMachine = require('javascript-state-machine');
var fsm = new StateMachine({
  init: 'blank',
  transitions: [
    {
      name: 'run',  
      from: 'blank',  
      to: 'login',
    },
    { name: 'login',        from: 'login',    to: 'loggedIn' },
    { name: 'collectStats', from: 'loggedIn', to: 'statsCollected' }
  ],
  methods: {
    async onBeforeRun() {
      const page = this.page;
      page.setViewport({
        width: 1300,
        height: 850,
      })
      await page.goto('https://app.tidepool.org/');
    },

    // async onAfterRun() {
    //   const page = this.page;
    //   try {
    //     const success = await page.waitForSelector('.Navbar-loggedInAs', {
    //       timeout: 7000
    //     });
    //     return success;
    //     // return 'loggedIn';
    //   } catch(ex) {
    //     // return 'login';
    //   }
    // },

    async _isLoggedIn() {
      const page = this.page;
      try {
        const success = await page.waitForSelector('.Navbar-loggedInAs', {
          timeout: 8000
        });
        return true;
      } catch(ex) {
        return false;
      }
    },

    async onBeforeLogin() {
      const page = this.page;
      let isLoggedIn = await this._isLoggedIn();
      if(isLoggedIn) {
        let link = await page.waitForSelector('.patientcard-actions-view');
        await link.click();
        return;
      }

      const username = await page.$('#username');
      await username.type(login.username);

      const password = await page.$('#password');
      await password.type(login.password);

      const rem = await page.$("#remember");
      await rem.click();

      await page.$$eval('button', els => {
        els = els.filter(el => el.textContent == 'Login')
        if(els.length === 1) {
          els[0].click();
          return;
        } else {
          throw new Error("can't find login btn")
        }
      })

      // return res;
    },

    async onBeforeCollectStats() {
      const page = this.page;
      await page.waitForSelector('.patient-data-chart');

      let item = await page.waitForSelector('.js-weekly');
      item.click();

      sleep.msleep(800);

      let showVals = await page.$('#valuesCheckbox');
      showVals.click();

      await page.screenshot({ path: './stats.png', fullPage: true })
    }
  }
});


puppeteer.launch({
  // headless: false,
  userDataDir: '/tmp/my-profile-directory'
})
.then(async browser => {
  fsm.browser = browser;
  const page = fsm.page = await browser.newPage();

  await loadCookies(page)

  await fsm.run();
  await fsm.login();
  await fsm.collectStats();

  await saveCookies(page)

  // await fsm.page.waitForNavigation();

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