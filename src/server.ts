import { createServer } from "http";
import { app, corsOptions } from "./app";
import { prisma } from "./config/prisma-client";
import { Server } from "socket.io";
import { socketJwtVerify } from "./sockets";
import { User } from "@prisma/client";

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

  socket.on(
    "message:create",
    async ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => {
      if (!content?.trim()) {
        return;
      }
      await prisma.message.create({
        data: {
          body: content,
          conversationId: conversationId,
          authorId: user.id,
        },
      });
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          users: true,
        },
      });
      const otherUser = conversation?.users.find((u) => u.id !== user.id);

      socket.to(`user:${otherUser.id}`).emit("message:create", {
        author: user.name,
        content: content,
      });
    },
  );
});

server.listen(port, () => {});
