const http = require("http");

http
  .createServer((req, res) => {
    console.log(`??不??不??不${req.url}--5201`);
  })
  .listen(5201, "localhost")
  .once("listening", () => {
    console.log(`??不??不??不5201`);
  });
