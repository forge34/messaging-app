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

  console.log(`${user.name} connected`);

  socket.join(`user:${user.id}`);
  socket.on("disconnect", () => {
    console.log(`${user.name} disconnected`);
  });

  socket.on("message:create", async ({ conversationId, content }) => {
    await prisma.message.create({
      data: {
        body: content,
        conversationId: conversationId,
        authorId: user.id,
      },
    });

    const otherUser = await prisma.user.findFirst({
      where: {
        conversations: {
          some: {
            users: {
              some: {
                id: {
                  contains: user.id,
                },
              },
            },
          },
        },
        NOT: {
          id: {
            contains: user.id,
          },
        },
      },
    });
    socket.to(`user:${otherUser.id}`).emit("message:create", {
      author: user.name,
      content: content,
    });
  });
});

server.listen(port, () => {
  console.log(`server running at port:${port}`);
});
