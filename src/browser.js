const { chromium } = require("playwright");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const util = require("util");
const constants = require("./constants.js");

class Browser {
  async launch(options) {
    var browser = await chromium.launch(options);
    this._browser = browser;
    return browser;
  }

  async newPage() {
    var page = await this._browser.newPage();
    return page;
  }

  async currentPage() {
    var pages = await browser.pages();
    var page;
    for (let i = 0; i < pages.length && !page; i++) {
      const isHidden = await pages[i].evaluate(() => document.hidden);
      if (!isHidden) {
        page = pages[i];
      }
    }
    this._currentPage = page;
    return page;
  }

  async lighthouse(flags) {
    var chrome = await chromeLauncher({ chromeFlags: flags });
    var response = await util.promisify(request)(
      `http://localhost:${chrome.port}/json/version`
    );
    var { webSocketDebuggerUrl } = JSON.parse(response.body);
    var browser = await chromium.connect({
      browserWSEndpoint: webSocketDebuggerUrl,
      defaultViewport: null,
    });
    this._chrome = chrome;
    this._browser = browser;
    return { chrome, browser };
  }

  async audit() {
    var options = {
      port: this._chrome.port,
      onlyCategories: ["performance"],
    };
    var configuration = {
      extends: "lighthouse:default",
      settings: {
        maxWaitForFcp: 15 * 1000,
        maxWaitForLoad: 35 * 1000,
        formFactor: "desktop",
        throttling: constants.throttling.desktopDense4G,
        screenEmulation: constants.screenEmulationMetrics.desktop,
        emulatedUserAgent: constants.userAgents.desktop,
        skipAudits: ["uses-http2"],
      },
    };
    var { report } = await lighthouse(
      this._currentPage.url(),
      options,
      configuration
    );
    return {
      FirstContentfulPaint: {
        score: report.audits["first-contentful-paint"].score,
        value: report.audits["first-contentful-paint"].numericValue,
      },
      TimeToInteractive: {
        score: report.audits.interactive.score,
        value: report.audits.interactive.numericValue,
      },
    };
  }

  async kill() {
    if (this._browser !== undefined) {
      await this._browser.disconnect();
    }
    if (this._chrome !== undefined) {
      await this._chrome.kill();
    }
  }
}

exports.Browser = new Browser();
