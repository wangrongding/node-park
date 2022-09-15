import { Server } from "socket.io";
import server from "http";

// const io = new Server(server);
const io = new Server();
io.on("connection", (client) => {
  console.log("hello world!");
});
io.listen(3000);
