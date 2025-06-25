import { createServer } from "http";
import { app, corsOptions } from "./app";
import { Server } from "socket.io";
import { socketJwtVerify } from "./sockets";
import { User } from "@prisma/client";
import { handleMessageCreate, handleMessageDelete } from "./sockets/handlers";

const port = process.env.PORT || 3000;
const server = createServer(app);

export const io = new Server(server, {
  cors: corsOptions,
});

io.engine.use(socketJwtVerify);

io.on("connection", (socket) => {
  const req = socket.request as any;
  const user = req.user as User;

  socket.join(`user:${user.id}`);
  socket.on("disconnect", () => {});

  const create = handleMessageCreate(user, socket);
  const deleteH = handleMessageDelete(socket);
  socket.on("message:create", create);
  socket.on("message:delete", deleteH);
});

if (process.env.NODE_ENV !== "test") {
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
