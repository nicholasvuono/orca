const { performance } = require("perf_hooks");

class Steps {
  constructor() {
    this._map = {};
  }

  async add(title, func, browser) {
    let start = performance.now();
    await func(browser);
    let time = (performance.now() - start).toFixed(0);
    if (this._map[title] === undefined) {
      this._map[title] = [];
    }
    let temp = this._map[title];
    temp.push(time);
    this._map[title] = temp;
    return this;
  }

  async timings() {
    for (var key in this._map) {
      let value = this._map[key];
      let sum = 0;
      for (var i = 0; i < value.length; i++) {
        sum += parseInt(value[i]);
      }
      this._map[key] = parseInt((sum / value.length).toFixed(0));
    }
    let sum = 0;
    for (var key in this._map) {
      let value = this._map[key];
      sum += parseInt(value);
    }
    this._map["TOTAL"] = sum;
    this._timings = this._map;
    this._map = {};
    return this;
  }
}

exports.Steps = new Steps();
