// const fs = require('fs');
// const options = {
//   key: fs.readFileSync('123.56.83.97-key.pem'),
//   cert: fs.readFileSync('123.56.83.97.pem')
// };
// const server = require("https").createServer(options);

const server = require("http").createServer();
const io = require("socket.io")(server, {
  cors: {
    origin: "*", // 允许跨域
    methods: ["GET", "POST"], // 允许的请求方法
  },
});

/* 保存房间信息 */
const roomList = [];
let admin = "";
io.on("connection", (socket) => {
  //
  socket.on("join room", (data) => {
    const filterRoom = roomList.filter((item) => item.roomId === data.roomId);
    let room = [{ roomId: data.roomId, userList: [] }];
    //
    if (!filterRoom.length) {
      roomList.push(...room);
    } else {
      room = filterRoom;
    }
    // 每个房间人数不超过8个人
    if (room.length && room[0].userList.length < 8) {
      return;
    }

    // 当房间里的人数为0且管理员还没有设置，设置管理员
    if (room[0].userList.length === 0 && admin === "") {
      admin = socket.id;
    }
    socket.join(data.roomId); /* 当前连接加入房间 */

    // 当房间里有该用户信息时
    if (room[0].userList.indexOf(socket.id) !== -1) {
      socket.emit("joining error", "该用户已连接，请确认您是否重复连接！");
      return;
    } else {
      room[0].userList.push(socket.id);
    }
    // 自定义属性
    socket.userId = data.userId;
    socket.roomId = data.roomId;

    // 转发给除自己以外的所有用户
    socket
      .to(room[0].roomId)
      .emit("welcome", `欢迎${data.userId}来到${admin}创建的房间`, socket.id);

    // 获取发送方客户端的数据
    socket.on("offer", (data, id) => {
      /* 转发给拥有该id的客户端 */
      socket.to(id).emit("offer", data, socket.id);
    });

    // 获取发送方客户端的数据
    socket.on("answer", (data, id) => {
      // 转发给拥有该id的客户端
      socket.to(id).emit("answer", data, socket.id);
    });

    // 获取发送方客户端的数据
    socket.on("send icecandidate", (data) => {
      /* 转发给除发送方，房间里的其他客户端 */
      socket.to(room[0].roomId).emit("send icecandidate", data, socket.id);
    });

    // 监听连接断开
    socket.on("disconnect", (reason) => {
      roomList.forEach((item) => {
        if (item.roomId === socket.roomId) {
          item.userList.splice(item.userList.indexOf(socket.id), 1);
          // 如果管理员断开连接，则就近选择一个认为是管理员
          if (socket.id === admin) {
            if (item.userList.length !== 0) {
              admin = item.userList[0];
            } else {
              admin = "";
            }
          }
        }
      });
      socket.to(room[0].roomId).emit("close", socket.userId, socket.id);
    });
  });
});

server.listen(3000);
