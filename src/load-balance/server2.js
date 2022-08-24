const http = require("http");

http
  .createServer((req, res) => {
    console.log(`🥰🥰  ${req.url}--5202`);
  })
  .listen(5202, "localhost")
  .once("listening", () => {
    console.log(`🥰🥰  5202`);
  });
