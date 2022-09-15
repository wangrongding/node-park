// import express from "express";
// const app = express();

// app.get("/", function (req, res) {
//   console.log(req.socket.remoteAddress);
//   console.log(req.ip);
//   res.send("your IP is: " + req.ip);
// });
// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log("server running on port: " + PORT);
// });

// const http = require("http");

// const requestListener = function (req, res) {
//   res.end("Your IP Addresss is: " + req.socket.localAddress);
// };

// const server = http.createServer(requestListener);
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// https://www.educative.io/answers/how-to-get-the-ip-address-of-a-client-in-nodejs

import os from "os";

function getIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (
        alias.family === "IPv4" &&
        alias.address !== "127.0.0.1" &&
        !alias.internal
      ) {
        return alias.address;
      }
    }
  }
}

console.log(getIPAddress());

const { execSync } = require("child_process");
// import 
const os = require("os");

// 根据最大值和最小值随机取一个出来
const randomNum = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getFreePort = (minPort = 10000, maxPorts = 50000) => {
  if (ports.length === 0) {
    console.info("分配端口已达最大限额");
    return null;
  }
  const port = randomNum(minPort, maxPorts);
  let stdout = null;

  try {
    if (os.type() === "Windows_NT") {
      //windows
    } else if (os.type() === "Darwin") {
      //mac
      stdout = execSync(`lsof -i:${port}`);
    } else if (os.type() === "Linux") {
      //Linux
      stdout = execSync(`netstat -anp | grep ${port}`);
    }
    if (!stdout) {
      return port;
    } else {
      return getFreePort();
    }
  } catch (e) {
    return port;
  }
};
console.log(getFreePort());
