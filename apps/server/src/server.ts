import { createServer } from "http";
import { app, corsOptions } from "./app.js";
import { Server, Socket } from "socket.io";
import { socketJwtVerify } from "./sockets/index.js";
import { prisma } from "@chat/db/client";
import {
  handleDisconnect,
  handleMessageCreate,
  handleMessageReaction,
  handleMessageRead,
} from "./sockets/handlers.js";
import {
  ClientToServerEvents,
  OnlineUsers,
  PublicUserSchema,
  ServerToClientEvents,
} from "@chat/shared";

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

const onlineId: OnlineUsers = new Map();

io.on("connection", async (socket) => {
  const req = socket.request as any;
  const user = req.user as PublicUserSchema;
  const isUserOnline = onlineId.get(user.id);

  if (isUserOnline && isUserOnline.timerId) {
    clearTimeout(isUserOnline.timerId);
  }

  onlineId.set(user.id, { isOnline: true, timerId: null });

  io.emit("users:presence_update", Array.from(onlineId.keys()));
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
  socket.on("message:read", handleMessageRead(user, socket));
  socket.on("message:reaction", handleMessageReaction(user, socket));
  socket.on("typing", (conversationId: string, username: string) => {
    socket.to(conversationId).emit("typing", username);
  });
  socket.on("typing:stop", (conversationId) => {
    socket.to(conversationId).emit("typing:stop");
  });
  socket.on("disconnect", handleDisconnect(user, onlineId));
});

if (process.env.NODE_ENV !== "test") {
  server.listen(port, () => {
    console.log(`Server running at ${port}`);
  });
}
