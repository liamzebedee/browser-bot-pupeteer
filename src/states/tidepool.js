
const sleep = require('sleep');
let login = require('../secrets').tidepool;

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

    async _isLoggedIn() {
      const page = this.page;
      try {
        const success = await page.waitForSelector('.Navbar-loggedInAs', {
          timeout: 8000
        });
        console.log(1111)
        return true;
      } catch(ex) {
        return false;
      }
    },

    async onBeforeLogin() {
      const page = this.page;
      let isLoggedIn = await this._isLoggedIn();
      if(isLoggedIn) {
        const page = this.page;
        await page.goto(`https://app.tidepool.org/patients/45e4223adf/data`)
        const success = await page.waitForSelector('.Navbar-loggedInAs', {
          timeout: 8000
        });
        
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

      item = await page.waitForSelector('.js-basics');
      item.click()
      sleep.msleep(800);
      await page.screenshot({ path: './stats-numtests.png', fullPage: true })
    }
  }
});

module.exports = fsm;