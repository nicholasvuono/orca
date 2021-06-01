const { Http } = require("../src/http.js");

async function test() {
  Http.options({
    vus: 1,
    duration: 1,
    ips: 1,
  });

  Http.requests([
    {
      url: "http://httpbin.org/get",
      method: "GET",
    },
    {
      url: "http://httpbin.org/post",
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: {
        name: "Test API Guy",
        email: "testapiguy@email.com",
      },
    },
  ]);
  await Http.send();
  await Http.report();
}

(async () => {
  await test();
})();
