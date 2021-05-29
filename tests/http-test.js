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
  let responses = await Http.responses();
  await Http.averageResonseTime();
  console.log("RESPONSES: " + responses);
  console.log(
    "RESPONSE COUNT: " +
      responses.length * responses[responses.length - 1].length
  );
  console.log(
    "AVERAGE RESPONSE TIME: " + Math.round(Http._average_response_time) + "ms"
  );
}

(async () => {
  await test();
})();
