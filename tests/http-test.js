const { Http } = require("../src/http.js");

async function test() {
  Http.options({
    limit: 3,
  });

  Http.requests([
    {
      url: "http://httpbin.org/get",
    },
    { url: "http://httpbin.org/get" },
    {
      url: "http://httpbin.org/get",
    },
  ]);

  console.log(Http._requests[0].url);

  Http.parallel();
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
