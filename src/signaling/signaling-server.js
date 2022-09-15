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

const io = new Server(httpServer, {
  cors: {
    origin: "*", // 允许跨域
    methods: ["GET", "POST"], // 允许的请求方法
  },
});

console.log("hello world~~");
// console.log(path.resolve(), "\n", __filename, "\n", __dirname);

// 房间信息
const ROOM_LIST = [];
// 每个房间最多容纳的人数
const MAX_USER_COUNT = 4;

io.on("connection", (socket) => {
  console.log("connection~");

  socket.on("join", (data) => {
    handleJoinRoom(socket, data);
  });
  //=============================
  // 监听连接断开
  socket.on("disconnect", () => {
    console.log("disconnect~");
  });
  // 监听错误
  socket.on("error", (err) => {
    console.log("error~", err);
  });
  // 监听重新连接
  socket.on("reconnect", (attemptNumber) => {
    console.log("reconnect~", attemptNumber);
  });
});

function handleJoinRoom(socket, data) {
  console.clear();
  console.log("join~", data);

  const filterRoom = ROOM_LIST.filter((item) => item.roomId === data.roomId)[0];
  let room = { roomId: data.roomId, userList: [] };
  // 判断房间是否存在
  if (filterRoom) {
    room = filterRoom;
  } else {
    ROOM_LIST.push(room);
  }
  // 每个房间人数不超过预设的人数
  if (room.userList.length > MAX_USER_COUNT) {
    socket.emit("error", "房间人数已满，请稍后再试");
    return;
  }

  // 当房间里的人数为0且管理员还没有设置，设置管理员
  if (room.userList.length === 0) {
    room.admin = data.userId;
  }

  // 判断用户是否已经在房间里
  if (room.userList.includes(data.userId)) {
    socket.emit("error", "用户已在房间内");
    return;
  } else {
    room.userList.push(data);
  }

  // 加入房间
  socket.join(data.roomId);

  // 通知房间内的其他用户
  socket.to(data.roomId).emit("join", data);
}

httpServer.listen(3000, "0.0.0.0", () => {
  console.log("Server up and running...");
});
// io.listen(3000);

// 创建信令服务器
