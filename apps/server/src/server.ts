import { createServer } from "http";
import { app, corsOptions } from "./app";
import { Server } from "socket.io";
import { socketJwtVerify } from "./sockets";
import { type User } from "@chat/db";
import { handleMessageCreate, handleMessageDelete } from "./sockets/handlers";

const port = process.env.PORT || 3000;
const server = createServer(app);

export const io = new Server(server, {
  cors: corsOptions,
});

io.engine.use(socketJwtVerify);

const onlineId: {
  userId: string;
  socketId: string;
}[] = [];

io.on("connection", (socket) => {
  const req = socket.request as any;
  const user = req.user as User;

  if (!onlineId.find((u) => u.userId === user.id))
    onlineId.push({ userId: user.id, socketId: socket.id });

  socket.join(`user:${user.id}`);

  io.emit("users:join", onlineId);
  const create = handleMessageCreate(user, socket);
  const deleteH = handleMessageDelete(socket);
  socket.on("message:create", create);
  socket.on("message:delete", deleteH);
  socket.on("disconnect", () => {
    const index = onlineId.findIndex((u) => u.socketId === socket.id);

    if (index !== -1) onlineId.splice(index, 1);

    io.emit("users:join", onlineId);
  });
});

if (process.env.NODE_ENV !== "test") {
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
