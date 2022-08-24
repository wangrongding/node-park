const http = require("http");

http
  .createServer((req, res) => {
    console.log(`🤣🤣🤣${req.url}--5201`);
  })
  .listen(5201, "localhost")
  .once("listening", () => {
    console.log(`🤣🤣🤣5201`);
  });
