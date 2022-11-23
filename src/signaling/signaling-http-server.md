## WebRTC 通过信令服务器自动建立连接，实现点对点音视频通话

### 前言

在上一篇文章中为了更直观的演示 WebRTC 建立点对点通信的过程，我们是通过手动交换 sdp 来建 p2p 连接的，但在实际的应用场景中，我们几乎不可能会通过手动来交换 sdp ，因为这样会增加很多的工作量，也不方便，所以我们需要一个信令服务器来帮助我们实现自动建立连接的过程。

![](https://assets.fedtop.com/picbed/202211132340780.png)

### 从这篇文章中你将学到

- 学会如何制作 https 的自签名证书
- 学会如何使用 nginx 反向代理 https
- 学会使用 socket.io 来实现客户端与信令服务器的通信
- 了解并实现一个 WebRTC + 信令服务器自动建立连接的音视频实时通话

![](https://assets.fedtop.com/picbed/202211132359202.png)

### 什么叫信令？

我们知道 `WebRTC` 想要直接通过 `P2P` 连接进行通信，需要一个中继的过程(在两个终端之间传递控制信息的过程)，这个中继的过程就称之为`信令`。  
所以简单来说，信令就是在两个设备之间发送控制信息以确定通信协议、信道、媒体编解码器和格式以及数据传输方法以及任何所需的路由信息的过程，而执行此操作的服务器称为`信令服务器`。

信令服务器按照与聊天室相同的方式对连接的节点进行逻辑分组，并帮助各端相互交换 `SDP` 等信息。

![](https://assets.fedtop.com/picbed/202211132222279.png)

> 关于 WebRTC 的信令流程最重要的一点是： **「信令在规范中并没有定义」** 所以开发者需要自己决定如何实现这个过程。开发者可以为应用程序引擎选择任意的信息协议（如 SIP 或 XMPP），任意双向通信信道（如 WebSocket 或 XMLHttpRequest) 与持久连接服务器的 API（如 Google Channel API）一起工作。

根据上面的说明我们就可以知道信令服务器的实现方式有很多种，可以根据要开发的服务的性质使用现有的信令协议，也可以通过轮询/长轮询或 websocket 等适当的双向通信通道来实现。

由于信令的核心是交换异步发送的对等信息（SDP，Candidate）。因此，将其实现为支持全双工通信的 websocket 最为合适。下面我面会通过 socket.io 来实现一个简单的信令服务器。

有点像村里相亲的，一开始不认识对方，没法直接联系，需要通过媒介，中间人来传递消息后，你们可能知道对方的位置啊，联系方式啊等等才能很好的直接建立联系。

![](https://assets.fedtop.com/picbed/202211220923424.png)

![](https://assets.fedtop.com/picbed/202211132222279.png)

这张图很清楚的描述了这个过程。

各端通过信令服务器交换 `SDP` 和 `候选者` 信息，然后各端通过 `P2P` 连接进行通信。

关于信令更多的详细内容可以参考：[MDN 信令的介绍](https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API/Session_lifetime#%E4%BF%A1%E4%BB%A4)，[MDN 信令与视频通话](https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API/Signaling_and_video_calling)

### 信令服务器的具体实现

下面我们主要使用 `socket.io` 来实现一个简单的信令服务器。

为什么使用它呢？

就像 Axios 是对 XMLHttpRequest 的封装， 而 Socket.io 就是对 WebSocket 的封装，并且实现了 WebSocket 的服务端代码。Socket.IO 将 WebSocket 和轮询（Polling）机制以及其它的实时通信方式封装成了通用的接口，并且在服务端实现了这些实时机制的相应代码。也就是说，WebSocket 仅仅是 Socket.IO 实现实时通信的一个子集。Socket.IO 简化了 WebSocket API，统一了返回传输的 API。

用它来写非常的简单方便，下面我们就用 express 配合 socket.io 来实现一个简单的信令服务器。

#### 信令服务器的搭建

首先我们要安装 `socket.io`

```bash
# 服务端
npm i express socket.io
```

然后我们创建一个 `server.js` 文件，用来启动信令服务器。

```js
import http from 'http'
import { Server } from 'socket.io'
import express from 'express'

const port = 3000
const app = express()
const httpServer = http.createServer(app)
// 创建信令服务器
const io = new Server(httpServer, {
  cors: {
    origin: '*', // 允许跨域
    methods: ['GET', 'POST'], // 允许的请求方式
    allowedHeaders: '*', // 允许的请求头
    credentials: true, // 允许携带cookie
  },
  allowEIO3: true, // 是否启用与Socket.IO v2客户端的兼容性
  transport: ['websocket'], // 仅允许websocket,["polling", "websocket"]
})

// 在指定端口启动服务器
httpServer.listen(port, () => {
  console.log('\n Http server up and running at => http://%s:%s', httpServer.address().address, httpServer.address().port)
})

// 监听用户连接
io.on('connection', (socket) => {
  console.log('connection~')

  // 监听连接断开
  socket.on('disconnect', () => {
    console.log('disconnect~')
  })
})
```

这里我们使用了 `express` 来创建一个简单的服务器，然后使用 `socket.io` 来创建一个 websocket 服务。

这样一个 简单 websocket 服务架子就搭好了。我们先启动这个服务.

```bash
node server.js
```

#### 客户端需要做的事情

然后我们在客户端也要安装配套的 `socket.io-client`

```bash
# 客户端
npm i socket.io-client
```

然后我们在客户端代码中引入 `socket.io-client`，并且连接到我们刚启动的信令服务。

```js
import io from 'socket.io-client'

// 连接到信令服务
const socket = io('http://localhost:3000')
```

由于 WebRTC 是需要在 `https` 协议下才能使用的，所以我们需要在本地生成一个 自签名的`https` 证书。（当然，你客户端直接在 localhost 下测试就不需要通过 https 了）。

要不然，你在 https 协议的页面，请求 http 资源时，浏览器会报错，因为 https 页面中的资源必须是 https 的，否则浏览器会阻止加载。

https，对应的我们信令服务的地址也需要是 https，不然就会报错

![](https://assets.fedtop.com/picbed/202209152158537.png)

所以下面我们需要自签一张证书。

### 自签证书

我们可以通过 openssl 生成自签证书，并将其保存在本地。我一直觉得用 OpenSSL 弄好麻烦，这里我使用 mkcert，它作为本地 https 的快速解决方案，用起来非常方便。

> [mkcert](https://github.com/FiloSottile/mkcert) 是一个用 Go 语言编写的工具，它可以轻松地为本地开发生成有效的 TLS 证书。它使用了一个名为 local CA 的根证书，这个根证书是由 mkcert 生成的，它会被安装到系统的受信任的根证书列表中。

下面一起来通过 mkcert 生成自签证书，并将其保存在本地。

#### 安装 mkcert 并生成证书

我这边使用的是 macos ，安装起来很方便，其他系统的安装方式可以参考 [mkcert 文档](https://github.com/FiloSottile/mkcert),[本地 https 快速解决方案——mkcert](https://blog.dteam.top/posts/2019-04/%E6%9C%AC%E5%9C%B0https%E5%BF%AB%E9%80%9F%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88mkcert.html)，基本都差不多

```sh
# 安装 mkcert
brew install mkcert
# 安装完成后，执行↓
mkcert -install
```

安装完成后，我们就可以使用 mkcert 生成自签证书了，这里我生成了一个名为 localhost 的证书，证书保存在当前目录下。

生成证书也很简单，就一行命令

```sh
# mkcert domain1 [domain2 [...]]

# 本地的直接这样就ok
mkcert localhost 127.0.0.1 ::1
```

生成的证书包含两个文件，一个是证书文件，一个是私钥文件，这两个文件都是必须的，因为证书文件是公开的，而私钥文件是私有的，它们是一对。

```sh
localhost.pem
localhost-key.pem
```

生成完毕后，不管你是在 nginx 中使用还是在 node 中使用，只需要将在 nginx 或者 node 中指定证书文件和私钥文件的路径即可。

![](https://assets.fedtop.com/picbed/202211231156906.png)

#### node 中使用

```js
import { Server } from 'socket.io'
import express from 'express'
import https from 'https'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

//https证书
const options = {
  cert: fs.readFileSync(path.join(__dirname, '../assets/localhost.pem')),
  key: fs.readFileSync(path.join(__dirname, '../assets/localhost-key.pem')),
}
const app = express()
const httpsServer = https.createServer(options, app)

httpsServer.listen(3333, '0.0.0.0', () => {
  console.log('Https server up and running...')
})
```

#### nginx 中使用

在本地测试的话怎么样都行，到线上环境的时候，可以去各大云服务商申请证书，上传到服务器和自签的证书一样使用就行了，这块就不多说了。

(需要注意的是，ip 证书非常的贵，一般都是直接用一个域名证书，然后通过 nginx 做转发)

![](https://assets.fedtop.com/picbed/202211230136032.png)  
或者你只是想在线上测试的话，也一样通过 mkcert 工具来生成本地的自签 HTTPS 证书就行了，只不过这个证书浏览器会提示不安全，但是用来测试还是可以的。

```sh
server {
    #SSL 默认访问端口号为 443
    listen 12345 ssl;
    #请填写证书文件的相对路径或绝对路径
    ssl_certificate /path/to/localhost.pem;
    #请填写私钥文件的相对路径或绝对路径
    ssl_certificate_key /path/to/localhost-key.pem;
    #请填写绑定证书的域名
    server_name localhost;

    location / {
      proxy_pass http://localhost:3000;

      # 为了让代理服务器了解客户端将协议切换到 WebSocket 的意图，下面三个标头必须加上
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';

      # http://nginx.org/en/docs/http/websocket.html
      # https://echizen.github.io/tech/2018/10-21-nginx-websocket
    }
}
```

#### 客户端使用

比如我这边用 vite 创建的项目，我在 vite.config.ts 中要配置 https，直接按照下面的代码配置就行了。其他脚手架生成的项目也是类似的。

```typescript
// https://vitejs.dev/config/
import * as fs from 'fs'

export default defineConfig((config) => ({
  // 配置主机、端口、https…
  server: {
    https: {
      key: fs.readFileSync(`${__dirname}/localhost-key.pem`),
      cert: fs.readFileSync(`${__dirname}/localhost.pem`),
    },
  },
}))
```

ok, 到这里，铺垫工作就完成了，下面我们就可以正式开始写相关逻辑了。

### 信令服务器逻辑实现

这里我们直接使用 socket.io 来实现服务端

```javascript
// 连接成功后
io.on('connection', (socket) => {
  // 监听用户加入房间
  socket.on('join', handleUserJoin)
  // 用户离开房间
  socket.on('leave', handleUserLeave)
  // 断线处理
  socket.on('disconnect', handleUserDisconnect)
  // 监听用户发送消息
  socket.on('message', handleUserMessage)
})
```

当服务器收到客户端 A 发送加入房间命令时，服务端除了需要把客户端 A 加入房间，还得把房间里的所有用户同步给该客户端 A，并且还需要广播到这个房间，客户端 A 加入房间了。如此，客户端之间就可以根据信息来逐个构建与其他用户的点对点连接。

```javascript
// 监听用户加入房间
function handleJoin(roomId, userId) {
  // 加入房间
  socket.join(data.room)
  // 获取房间里的所有用户
  var userList = io.sockets.adapter.rooms.get(data.room)
  // 向当前用户发送所有用户信息
  socket.emit('joined', [...userList].join(','))
  // 向房间内的其他用户广播新用户加入信息
  socket.to(data.room).emit('newUserJoined', socket.id)
}
```

若有用户离开，服务器便处理其用户的离开命令，然后在房间内的其他客户端根据信息关闭与离开用户的信息，并作相应的清除操作

```javascript
// 用户离开房间
function handleLeave(roomId, userId) {
  // 离开房间
  socket.leave(data.room)
  // 向房间内的其他用户广播用户离开信息
  socket.to(data.room).emit('userLeft', socket.id)
}
```

### 部署信令服务器

本来想不通过服务器,把这个信令服务托管在 Vercel 上，看了下，Vercel 上部署 nodejs 服务是属于 Serverless 来实现的， 虽然目前有些厂商的做的 Serverless 能够保存状态，但很遗憾 Vercel 的 Serverless 的是无状态的，且 Vercel 对其有一个最大的执行时间的限制。因此，不能维持一个 WebSocket 连接。没有服务器的小伙伴可以使用类似于 ngrok 这样的工具来实现内网穿透，然后在本地启动一个 WebSocket 服务，然后在 vercel 上部署一个简单的页面，通过 WebSocket 连接到本地的 WebSocket 服务。

### pm2 部署

pm2 是一个带有负载均衡功能的 Node 应用的进程管理器，可以让你的 Node 应用始终保持在线，同时提供了一些其他的功能，比如日志记录、进程监控、进程守护等。

#### 安装

```bash
# 安装 pm2
npm install pm2 -g

# 启动
pm2 start index.js

# 查看
pm2 list

# 停止
pm2 stop index.js

# 重启
pm2 restart index.js

# 删除
pm2 delete index.js
```

#### 开机自启动

```bash
# 生成开机启动脚本
pm2 startup
# 保存当前进程列表
pm2 save
```

### 信令服务建立连接时必须知道的几个概念

3. `STUN`：`Session Traversal Utilities for NAT`，用于在 NAT 网络中穿越防火墙的会话遍历实用程序，它可以帮助我们在 NAT 网络中穿越防火墙，从而建立连接。
4. `TURN`：`Traversal Using Relays around NAT`，使用 NAT 围绕中继进行遍历，它可以帮助我们在 NAT 网络中穿越防火墙，从而建立连接。

#### 用户唯一标识

- [@fingerprintjs/fingerprintjs-pro]https://segmentfault.com/q/1010000041271387

![](https://assets.fedtop.com/picbed/202209150123502.png)

### 一些我遇到的问题

1. 手机端连接有问题？

用手机打开 web 应用时，通过 network 查看所有的请求的 status 返回的都是 0，这是因为 IOS

页面要是在 android 或者网页里请求都是可以的，唯独 ios 不行，奇怪？主要 ios 的 safari 内核的问题，如果服务端设置了

```sh
Access-Control-Allow-Headers : "*"
```

https://segmentfault.com/q/1010000022821186

## 最后

**然而这个世界上没有绝对完美的东西， WebRTC 自身仍存在一些缺憾：**

- 兼容性问题。在 Web 端存在浏览器之间的兼容性问题，虽然 WebRTC 组织在 GitHub 上提供了 WebRTC 适配器，但除此之外仍要面临浏览器行为不一致的问题
- 传输质量不稳定。由于 WebRTC 使用的是对点对传输，跨运营商、跨地区、低带宽、高丢包等场景下的传输质量基本听天由命。
- 移动端适配差。针对不同机型需要做适配，很难有统一的用户体验。

讲到这里就结束了，WebRTC 着实让我体会了一次它在音视频领域的强大。在浏览器支持上，除了 IE 之外， Chrome、Firefox、Safari、Microsoft Edge 等主流浏览器都已支持 WebRTC，多种音视频开发场景如在线课堂、远程屏幕等也得到广泛应用。在未来，希望它能给我们带来更多惊喜！

## WebRTC 各种协议是如何相互交互的？

https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API/Connectivity

## 相关链接

### 相关文章

- [WebRTC 是如何工作的？](https://www.agora.io/cn/community/blog-121-category-24640)
- https://webrtc.org.cn/webrtc-tutorial-2-signaling-stun-turn/
- https://juejin.cn/post/6844903844904697864#heading-5

- https://juejin.cn/post/6844903798750576647
- https://juejin.cn/post/7129763930779418654
- https://juejin.cn/post/7000205126719766565
- https://juejin.cn/post/6881551269514149896
- https://juejin.cn/post/6884851075887661070
- https://juejin.cn/post/6952849597148430344

- https://zhuanlan.zhihu.com/p/75492311
- https://zhuanlan.zhihu.com/p/76615314
- https://zhuanlan.zhihu.com/p/75387873
- https://zhuanlan.zhihu.com/p/73914640

- 配置 coturn https://juejin.cn/post/6999962039930060837
- https://webrtc.github.io/samples/
- [turn、turn 服务测试地址](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/)
- [WebRTC，无信号传递 SDP。示例](https://divanov11.github.io/WebRTC-Simple-SDP-Handshake-Demo/)

### 相关 git 仓库

- https://github.com/feixiao/learning_webrtc/blob/master/learning-webrtc/README.md
- https://github.com/AgoraIO/API-Examples-Web
