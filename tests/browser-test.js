const { Browser } = require("../src/browser.js");

async function test() {
  await Browser.launch({ headless: true });
  await Browser.newPage();
  await Browser._page.goto("http://wosp.io");
  Browser.kill();
}

async function test2() {
  await Browser.lighthouse(
    [
      "--headless",
      "--enable-automation",
      "--disk-cache-size=0",
      "--memory-cache-size=0",
    ],
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  );
  await Browser.newPage();
  await Browser._page.goto("http://wosp.io");
  await Browser.currentPage();
  await Browser.audit();
  console.log(Browser._lighthouse_report_metrics);
  Browser.kill();
}

(async () => {
  await test();
  await test2();
})();
