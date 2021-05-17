const http = require("http");
const async = require("async");

class Http {
  constructor() {
    this._requests = [];
    this._results = [];
  }

  options(options) {
    this._options = options;
    return this;
  }

  batch(requests) {
    for (var i = 0; i < requests.length; i++) {
      this._requests.push(function (callback) {
        http
          .request(requests[i], function (res) {
            callback(null, res.statusCode);
          })
          .end();
      });
    }
    async.parallelLimit(requests, this._options.limit, function (err, results) {
      this._results.push(JSON.stringify(results));
    });
  }
}

exports.Http = new Http();
