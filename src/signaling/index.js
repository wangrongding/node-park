import { Server } from "socket.io";
import http from "http";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, "./")));
const httpServer = http.createServer(app);
const io = new Server(httpServer);
httpServer.listen(3000);

console.log("hello world!");
console.log(path.resolve(), "\n", __filename, "\n", __dirname);

io.on("connection", (socket) => {
  socket.emit("hello", "world");
  socket.on("hello", (data) => {
    console.log(data);
  });
  console.log("hello world!");
});

// io.listen(3000);

// 创建信令服务器
