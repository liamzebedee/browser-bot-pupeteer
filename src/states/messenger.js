
const sleep = require('sleep');
let login = require('../secrets').facebook;

var StateMachine = require('javascript-state-machine');
var fsm = new StateMachine({
  init: 'blank',
  transitions: [
    {
        name: 'run',  
        from: 'blank',  
        to: 'login',
    },
    {
        name: 'login',
        from: 'login',
        to: 'chats'
    },
    {
        name: 'sendMessage',
        from: 'chats',
        to: 'chats'
    }
  ],
  methods: {
    async onBeforeRun() {
      const page = this.page;
      page.setViewport({
        width: 1300,
        height: 850,
      })
      await page.goto('https://messenger.com/');
    },

    async onBeforeLogin() {
        const page = this.page;
        await page.waitFor(500);
        
        try {
            await page.waitForSelector(`input[placeholder="Search Messenger"]`, { timeout: 3000 });
            return;

        } catch(ex) {
            const username = await page.waitForSelector('#email');
            await username.type(login.username);
      
            const password = await page.waitForSelector('#pass');
            await password.type(login.password);
      
            const submit = await page.waitForSelector('#loginbutton');
            await submit.click();
        }
    },

    async sendMessages1() {
        const page = this.page;

        // page.goto(`https://www.messenger.com/t/sean.edwards.921677`);
        await Promise.all([
            page.goto(`https://www.messenger.com/t/100007106130451`),
            page.waitForNavigation()
        ]);
        
        const upload = await page.waitForSelector("input[title='Add Files']");

        await upload.uploadFile('./stats.png');

        await page.waitFor(4000);

        let els = await page.$x(`//div[contains(string(), "Type a message")]`)
        
        let typeMsg = els[els.length - 1];
        
        let { x,y } = await typeMsg.boundingBox();
        
        page.mouse.click(x, y);
        page.keyboard.press("Enter");

        await page.waitFor(7000);
    }

  }
});

module.exports = fsm;