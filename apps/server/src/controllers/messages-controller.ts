import { User } from "@chat/db/client";
import {  Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import passport from "passport";
import { prisma } from "@chat/db/client";

class MessagesController {
  static bookmarkMessage = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    expressAsyncHandler(async (req: Request, res: Response) => {
      const messageId = String( req.params.messageid );
      const user = req.user as User;

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

        res.status(200).json({ message: "message bookmarked" });
      } else {
        res.status(404).json({ message: "message not found" });
      }
    }),
  ];
}

export default MessagesController;
