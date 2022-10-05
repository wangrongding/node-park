# 信令服务器

## 自签证书

https://www.jianshu.com/p/7cb5c2cffaaa

我们可以通过 openssl 生成自签证书，并将其保存在本地。
但是好麻烦，这里我使用 mkcert 工具生成自签证书，并将其保存在本地。

```sh
brew install mkcert
mkcert -install
```

```sh
mkcert localhost 127.0.0.1 ::1 192.168.1.126
```

## 信令服务器

### 什么是信令服务器

在了解信令服务器是什么之前，我们需要知道的是 WebRTC 是一个用来实现实时通信的技术，它可以在浏览器之间进行点对点通信，提供了浏览器之间的点对点的通信能力，但是想实现一个实时互动的场景，仅仅依靠 webRTC 是不够的，我们还需要提供一个用于帮助客户端之间在尽可能少的暴露隐私的情况下`相互定位`并`交换协商信息`的`中间人`来建立连接，提供用户管理、房间管理、消息转发等功能。 因为客户端双方只有交换协商信息后才能实现实时通信，这个过程便被称为信令。
这样，我们才能在浏览器上更好的构建与其他用户的点对点连接。

### 信令服务器的作用

信令服务器的作用是用来协调 WebRTC 的连接，它是 WebRTC 的必要组成部分。

### 信令服务器的实现方式

因为 webRTC 技术并没有提供信令传递机制，所以我们需要自己实现信令服务器。
实现信令服务器的方式有很多，比如使用 HTTP、Websocket 和数据通道等。
一般来说，信令服务器的最佳实践方式是使用 Websocket 来进行通信。保证信令服务器的实时性的同时又简单高效。

### 实现一个简单的 WebSocket 信令服务器

这里我们直接使用 socket.io 来实现服务端

```javascript
// 连接成功后
io.on("connection", (socket) => {
  // 监听用户加入房间
  socket.on("join", handleUserJoin);
  // 用户离开房间
  socket.on("leave", handleUserLeave);
  // 断线处理
  socket.on("disconnect", handleUserDisconnect);
  // 监听用户发送消息
  socket.on("message", handleUserMessage);
});
```

当服务器收到客户端 A 发送加入房间命令时，服务端除了需要把客户端 A 加入房间，还得把房间里的所有用户同步给该客户端 A，并且还需要广播到这个房间，客户端 A 加入房间了。如此，客户端之间就可以根据信息来逐个构建与其他用户的点对点连接。

```javascript
// 监听用户加入房间
function handleJoin(roomId, userId) {
  // 加入房间
  socket.join(data.room);
  // 获取房间里的所有用户
  var userList = io.sockets.adapter.rooms.get(data.room);
  // 向当前用户发送所有用户信息
  socket.emit("joined", [...userList].join(","));
  // 向房间内的其他用户广播新用户加入信息
  socket.to(data.room).emit("newUserJoined", socket.id);
}
```

若有用户离开，服务器便处理其用户的离开命令，然后在房间内的其他客户端根据信息关闭与离开用户的信息，并作相应的清除操作

```javascript
// 用户离开房间
function handleLeave(roomId, userId) {
  // 离开房间
  socket.leave(data.room);
  // 向房间内的其他用户广播用户离开信息
  socket.to(data.room).emit("userLeft", socket.id);
}
```

### 数据通道

HTTP、Websocket 和数据通道

## webRTC 的安全隐患

https://www.expressvpn.com/webrtc-leak-test

https://www.expressvpn.com/webrtc-leak-test#chrome

https://www.expressvpn.com/internet-privacy/webrtc-leaks/

## IP 查询

https://www.ip138.com/

https://nordvpn.com/zh/ip-lookup/

获取 IP 地址
https://iq.opengenus.org/get-ip-addresses-using-javascript/

检测 ice 穿透的在线工具

https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
