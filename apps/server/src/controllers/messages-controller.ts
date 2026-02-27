import passport from "passport";
import { prisma } from "@chat/db/client";
import { createHandler } from "../lib/create-handler.js";
import { PublicUserSchema, Routes } from "@chat/shared";

class MessagesController {
  static bookmarkMessage = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    createHandler(Routes.bookmarkMessage, async (req, res) => {
      const messageId = String(req.params.id);
      const user = req.user as PublicUserSchema;

      const message = await prisma.message.findFirst({
        where: { id: messageId },
      });

      if (message) {
        await prisma.user.update({
          include: {
            bookmarks: true,
          },
          where: {
            id: user.id,
          },
          data: {
            bookmarks: {
              connect: [{ id: message.id }],
            },
          },
        });

        return { code: 200, message: "message bookmarked" };
      } else {
        res.status(404).json({ message: "message not found" });
        return;
      }
    }),
  ];
}

export default MessagesController;
