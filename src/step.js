const { performance } = require("perf_hooks");

class Steps {
  constructor() {
    this._map = {};
  }

  add(title, func, browser) {
    let start = performance.now();
    await func(browser);
    let time = (performance.now() - start).toFixed(2)
    if (this._map[title] === undefined){
        this._map[title] = [];
    } else {
        temp = this._map[title];
        temp.push(time)
        this._map[title] = temp;
    }
    return this;
  }

  timings() {
    for (var key in this._map) {
        let value = map[key];
        let average = ((value) => {
            let sum = 0;
            for (var i = 0; i < value; i ++){
                sum += value[i]
            }
            return (sum/value).toFixed(2);
        }, value);
        this._map[key] = average;
    }
    let sum = 0;
    for (var key in this._map) {
        sum += this._map[key]
    }
    this._map["TOTAL"] = sum;
    this._timings = this._map;
    this._map = {};
    return this;
  }
}

exports.Steps = new Steps();
