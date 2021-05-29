const request = require("request");

class Http {
  constructor() {
    this._responses = [];
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
    for (var i = 0; i < this._responses.length; i++) {
      let resp = await Promise.all(this._responses[i]);
      responses.push(resp);
    }
    return responses;
  }

  async averageResonseTime() {
    let responses = await this.responses();
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
          { url: this._requests[i].url, time: true },
          (err, res, body) => {
            if (err) return reject(err);
            return resolve(res);
          }
        );
      });
      results.push(result);
    }
    this._responses.push(results);
  }

  async concurrent() {
    let results = [];
    for (var i = 0; i < this._requests.length; i++) {
      let result = new Promise((resolve, reject) => {
        request(
          { url: this._requests[i].url, time: true },
          (err, res, body) => {
            if (err) return reject(err);
            return resolve(res);
          }
        );
      });
      results.push(result);
    }
    this._responses.push(results);
  }

  async parallel() {
    for (var i = 0; i < this._options.limit; i++) {
      this.concurrent();
    }
  }
}

exports.Http = new Http();
