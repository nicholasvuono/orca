const { Http } = require("../src/http.js");

async function test() {
  Http.options({
    vus: 5,
    duration: 30,
    ips: 2,
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
}

(async () => {
  await test();
})();
