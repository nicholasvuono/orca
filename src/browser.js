const puppeteer = require("puppeteer");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const util = require("util");
const constants = require("./constants.js");
const request = require("request");
const { performance } = require("perf_hooks");

class Browser {
  async launch(options) {
    var browser = await puppeteer.launch(options);
    this._browser = browser;
    return this;
  }

  async newPage() {
    var page = await this._browser.newPage();
    this._page = page;
    return this;
  }

  async currentPage() {
    var page = await this._browser
      .targets()
      [this._browser.targets().length - 1].page();
    this._currentPage = page;
    return this;
  }

  async lighthouse(flags, path) {
    var chrome = await chromeLauncher.launch({
      chromeFlags: flags,
      chromePath: path,
    });
    var response = await util.promisify(request)(
      `http://localhost:${chrome.port}/json/version`
    );
    var { webSocketDebuggerUrl } = JSON.parse(response.body);
    var browser = await puppeteer.connect({
      browserWSEndpoint: webSocketDebuggerUrl,
      defaultViewport: null,
    });
    this._chrome = chrome;
    this._browser = browser;
    return this;
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
    var { lhr } = await lighthouse(
      this._currentPage.url(),
      options,
      configuration
    );
    var metrics = {
      FirstContentfulPaint: {
        score: lhr.audits["first-contentful-paint"].score,
        value: lhr.audits["first-contentful-paint"].numericValue,
      },
      TimeToInteractive: {
        score: lhr.audits.interactive.score,
        value: lhr.audits.interactive.numericValue,
      },
    };
    this._lighthouse_report_metrics = metrics;
    return this;
  }

  async resources() {
    var resources = [];
    let entries = JSON.parse(
      await this._currentPage.evaluate(() =>
        JSON.stringify(window.performance.getEntries())
      )
    );
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].name.includes(".js") || entries[i].name.includes(".css")) {
        let result = new Promise((resolve, reject) => {
          request.get(
            { url: entries[i].name, time: true },
            (err, res, body) => {
              if (err) return reject(err);
              let size = res.headers["content-length"];
              let time = res.elapsedTime;
              if (size === undefined) size = 0;
              return resolve({ size, time });
            }
          );
        });
        var { size, time } = await result;
        resources.push({
          url: entries[i].name,
          size: parseInt(size, 10),
          time: time,
        });
      }
    }
    this._resources = resources;
    return this;
  }

  async timeElement(selector) {
    let loadEvents = ["load", "domcontentloaded", "networkidle0"];
    let eventTimings = async () => {
      let timings = [];
      for (var i = 0; i < loadEvents.length; i++) {
        this._currentPage.setCacheEnabled(false);
        await this._currentPage.goto(this._currentPage.url(), {
          waitUntil: loadEvents[i],
        });
        let start = performance.now();
        try {
          await this._currentPage.waitForSelector(selector, { visible: true });
          let time = parseInt((performance.now() - start).toFixed(0));
          timings.push(time);
        } catch (error) {
          console.log(`${selector} not found during ${loadEvents[i]}`);
        }
      }
      return {
        selector: selector,
        eventTimings: {
          load: timings[0],
          domcontentloaded: timings[1],
          networkidle0: timings[2],
        },
      };
    };
    this._element_timings = await eventTimings();
    return this;
  }

  async kill() {
    if (this._browser !== undefined) {
      await this._browser.close();
    } else if (this._chrome !== undefined) {
      await this._chrome.kill();
    }
  }
}

exports.Browser = new Browser();
