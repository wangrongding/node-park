import { Server } from "socket.io";
import express from "express";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//https证书
const options = {
  key: fs.readFileSync(path.join(__dirname, "../assets/localhost+3-key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "../assets/localhost+3.pem")),
};

const app = express();
app.use(express.static(path.join(__dirname, "./")));
const httpsServer = https.createServer(options, app);

httpsServer.listen(3000, "0.0.0.0", () => {
  console.log("Https server up and running...");
});

// 创建信令服务器
const io = new Server(httpsServer, {
  cors: {
    origin: "*", // 允许跨域
    methods: ["GET", "POST"], // 允许的请求方法
  },
});

// 房间信息
const ROOM_LIST = [];
// 每个房间最多容纳的人数
const MAX_USER_COUNT = 4;

io.on("connection", (socket) => {
  console.log("connection~");
  // 用户加入房间
  socket.on("join", (data) => {
    console.log("join~", data);
    handleUserJoin(socket, data);
  });
  // 用户离开房间
  socket.on("leave", (data) => {
    console.log("leave", data);
    // handleUserLeave(data);
    handleUserDisconnect(socket);
  });
  // 监听连接断开
  socket.on("disconnect", () => {
    console.log("disconnect~");
    handleUserDisconnect(socket);
  });
  //=============================
  socket.on("offer", (data) => {
    console.log("offer", data);
    socket.to(data.roomId).emit("offer", data);
  });
  socket.on("answer", (data) => {
    console.log("answer", data);
    socket.to(data.roomId).emit("answer", data);
  });
  socket.on("candidate", (data) => {
    console.log("candidate", data);
  });
  socket.on("message", (data) => {
    console.log("offer", data);
  });
});

function handleUserJoin(socket, data) {
  console.log("🚀🚀🚀 / handleUserJoin", handleUserJoin);
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
    // // 通知自己创建 offer
    // socket.emit("createOffer", data);
  }

  // 判断用户是否已经在房间里
  const filterUser = room.userList.filter(
    (item) => item.userId === data.userId
  )[0];
  if (filterUser) {
    socket.emit("error", "用户已在房间里");
  } else {
    room.userList.push(data);
    console.log(data, "加入房间");
    // 通知房间内的其他用户
  }
  socket.userId = data.userId;
  socket.roomId = data.roomId;

  // 将用户加入房间
  socket.join(data.roomId);
  // 通知自己加入房间成功
  socket.emit("joined", data);
  // 通知房间内的其他用户
  socket.to(data.roomId).emit("welcome", data);
  // 通知房间内的其他用户创建 offer
  socket.to(data.roomId).emit("createOffer", data);
  console.log("🚀🚀🚀room.userList", room.userList);
}

// 用户断开连接或离开房间，清除房间内的用户信息，关闭房间，通知房间内的其他用户
function handleUserDisconnect(socket) {
  console.log("🚀🚀🚀 / handleUserDisconnect", socket.userId, socket.roomId);
  const roomId = socket.roomId;
  const userId = socket.userId;
  const room = ROOM_LIST.filter((item) => item.roomId === roomId)[0];
  if (room) {
    const userList = room.userList;
    const filterUser = userList.filter((item) => item.userId === userId)[0];
    if (filterUser) {
      // 通知房间内的其他用户
      socket.to(roomId).emit("leave", filterUser);
      console.log(userId, "离开房间");
      // 清除房间内的用户信息
      room.userList = userList.filter((item) => item.userId !== userId);
      // 关闭房间
      if (room.userList.length === 0) {
        ROOM_LIST.splice(ROOM_LIST.indexOf(room), 1);
      }
    }
  }
}

// io.listen(3001);
