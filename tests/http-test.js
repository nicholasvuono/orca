const { Http } = require("../src/http.js");

async function test() {
  Http.options({
    vus: 1,
    duration: 60,
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

  //console.log(Http._requests[0].url);

  //Http.parallel();
  await Http.send();
  await Http.averageResonseTime();
  console.log(Http._responses);
  console.log(
    "RESPONSE COUNT: " +
      Http._responses.length *
        Http._responses[Http._responses.length - 1].length
  );
  console.log(
    "AVERAGE RESPONSE TIME: " + Math.round(Http._average_response_time) + "ms"
  );
}

(async () => {
  await test();
})();
