import { createServer } from "http";
import { app, corsOptions } from "./app.js";
import { Server, Socket } from "socket.io";
import { socketJwtVerify } from "./sockets/index.js";
import { prisma, type User } from "@chat/db/client";
import {
  handleMessageCreate,
  handleMessageDelete,
  handleMessageRead,
} from "./sockets/handlers.js";
import { ClientToServerEvents, ServerToClientEvents } from "@chat/shared";

const port = Number(process.env.PORT) || 3000;
const server = createServer(app);

export const io = new Server<ClientToServerEvents, ServerToClientEvents>(
  server,
  {
    cors: corsOptions,
  },
);

export type ServerSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
io.engine.use(socketJwtVerify);

const onlineId: {
  userId: string;
  socketId: string;
}[] = [];

io.on("connection", async (socket) => {
  const req = socket.request as any;
  const user = req.user as User;

  if (!onlineId.find((u) => u.userId === user.id))
    onlineId.push({ userId: user.id, socketId: socket.id });

  const conversations = await prisma.conversation.findMany({
    where: {
      users: {
        some: {
          id: user.id,
        },
      },
    },
  });

  conversations.forEach((c) => {
    socket.join(c.id);
  });

  const create = handleMessageCreate(user, socket);
  socket.on("message:create", create);
  socket.on("message:delete", handleMessageDelete);
  socket.on("message:read", handleMessageRead(user, socket));
  socket.on("typing", (conversationId: string, username: string) => {
    socket.to(conversationId).emit("typing", username);
  });
  socket.on("typing:stop", (conversationId) => {
    socket.to(conversationId).emit("typing:stop");
  });
  socket.on("disconnect", () => {
    const index = onlineId.findIndex((u) => u.socketId === socket.id);

    if (index !== -1) onlineId.splice(index, 1);
  });
});

if (process.env.NODE_ENV !== "test") {
  server.listen(port, () => {
    console.log(`Server running at ${port}`);
  });
}
