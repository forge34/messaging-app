import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import passport from "passport";
import { prisma } from "../config/prisma-client";

class MessagesController {
  static createMessage = [
    body("content").trim().isLength({ min: 1 }).escape(),
    passport.authenticate("jwt", { session: false, failWithError: true }),
    expressAsyncHandler(
      async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    ),
    expressAsyncHandler(async (req: Request, res: Response) => {
      const messageBody: string = req.body.content;
      const conversationId: string = req.params.conversationid;
      const currentUser = req.user as User;

      const newMessage = await prisma.message.create({
        data: {
          body: messageBody,
          conversationId: conversationId,
          authorId: currentUser.id,
        },
      });

      res.status(200).json({ message: "message created", data: newMessage });
    }),
  ];

  static bookmarkMessage = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    expressAsyncHandler(async (req: Request, res: Response) => {
      const messageId = req.params.messageid;
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

  static deleteMessage = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    expressAsyncHandler(async (req: Request, res: Response) => {
      const messageId = req.params.messageid;

      await prisma.message.delete({
        where: {
          id: messageId,
        },
      });

      res.status(200).json({ message: "message deleted" });
    }),
  ];
}

export default MessagesController;
