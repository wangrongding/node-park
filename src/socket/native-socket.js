import { WebSocketServer } from "ws";

// 创建socket实例
const wss = new WebSocketServer({
  port: 3000,
});

wss.on("connection", (ws, req) => {
  console.log("🥰🥰客户端已链接");
  ws.on("message", (data) => {
    console.log("收到客户端发送的消息", data.toString());
  });
  ws.send("哈喽，我是服务端~");
});
