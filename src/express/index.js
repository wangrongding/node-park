import http from "http";
import express from "express";
import os from "os";

// const host = "0.0.0.0";
const host = getIntranetIp();
const port = 1234;
const app = express();

//设置跨域访问
app.all("*", (req, res, next) => {
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin", "*");
  //允许的header类型
  res.header("Access-Control-Allow-Headers", "content-type");
  //跨域允许的请求方式
  res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
  //让options尝试请求快速结束
  if (req.method.toLowerCase() == "options") res.send(200);
  else next();
});

// 随便写一个接口测试一下
app.get("/test", (req, res) => {
  res.type("application/json");
  res.end(JSON.stringify({ status: 0, message: "测试成功~🌸" }, "utf8"));
});

const httpServer = http.createServer(app);
httpServer.listen(port, host, () => {
  const host = httpServer.address().address;
  const port = httpServer.address().port;
  console.log("\n Http server up and running at => http://%s:%s", host, port);
});

// 获取内网ip
export function getIntranetIp() {
  const interfaces = os.networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (
        alias.family === "IPv4" &&
        alias.address !== "127.0.0.1" &&
        !alias.internal
      ) {
        console.log(`\n🌐 ip: ${alias.address}`);
        console.log(`🌐 mac: ${alias.mac}`);
        console.log(`🌐 netmask: ${alias.netmask} \n`);

        return alias.address;
      }
    }
  }
  return "0.0.0.0";
}
