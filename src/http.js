const request = require("request");
const { performance } = require("perf_hooks");

class Http {
  constructor() {
    this._results = [];
  }

  options(options) {
    this._options = options;
    return this;
  }

  requests(requests) {
    this._requests = requests;
    return this;
  }

  async responses() {
    let responses = [];
    for (var i = 0; i < this._results.length; i++) {
      let resp = await Promise.all(this._results[i]);
      responses.push(resp);
    }
    this._responses = responses;
    return this;
  }

  async averageResonseTime() {
    await this.responses();
    let responses = this._responses;
    let responseTimes = [];
    for (var i = 0; i < responses.length; i++) {
      for (var j = 0; j < responses[i].length; j++) {
        responseTimes.push(responses[i][j].elapsedTime);
      }
    }
    let sum = 0;
    for (var k = 0; k < responseTimes.length; k++) {
      sum = sum + responseTimes[k];
    }
    let average = sum / responseTimes.length;
    this._response_times = responseTimes;
    this._average_response_time = average;
    return this;
  }

  async sequential() {
    let results = [];
    for (var i = 0; i <= this._requests.length; i++) {
      let result = await new Promise((resolve, reject) => {
        request(
          {
            url: this._requests[i].url,
            method: this._requests[i].method,
            headers: this._requests[i].headers,
            body: this._requests[i].body,
            json: true,
            time: true,
          },
          (err, res, body) => {
            if (err) return reject(err);
            return resolve(res);
          }
        );
      });
      results.push(result);
    }
    this._results.push(results);
  }

  async concurrent() {
    let results = [];
    for (var i = 0; i < this._requests.length; i++) {
      let result = new Promise((resolve, reject) => {
        request(
          {
            url: this._requests[i].url,
            method: this._requests[i].method,
            headers: this._requests[i].headers,
            body: this._requests[i].body,
            json: true,
            time: true,
          },
          (err, res, body) => {
            if (err) return reject(err);
            return resolve(res);
          }
        );
      });
      results.push(result);
    }
    this._results.push(results);
  }

  async parallel() {
    for (var i = 0; i < this._options.vus; i++) {
      this.concurrent();
    }
  }

  async send() {
    process.stdout.write("RUNNING:\n");
    let end = performance.now() + this._options.duration * 1000;
    while (performance.now() < end) {
      for (var i = 0; i < this._options.ips; i++) {
        this.parallel();
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      process.stdout.write("|");
    }
    process.stdout.write("\n...COMPLETE");
  }
}

exports.Http = new Http();
