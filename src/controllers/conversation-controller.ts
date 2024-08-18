import expressAsyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import { PrismaClient, User } from "@prisma/client";
import { Request, Response } from "express";
import passport from "passport";

const prisma = new PrismaClient();

class ConversationController {
  static create = [
    passport.authenticate("jwt", { session: false }),
    body("title").trim().optional().isLength({ min: 1 }).escape(),
    body("otherId").trim().isLength({ min: 1 }).escape(),
    expressAsyncHandler(async (req: Request, res: Response) => {
      const errors = validationResult(req);
      const otherUser = await prisma.user.findUnique({
        where: {
          id: req.body.otherId,
        },
      });
      const currentUser = req.user as User;
      console.log(currentUser);
      if (errors.isEmpty()) {
        await prisma.conversation.create({
          data: {
            title: req.body.title || otherUser.name,
            users: {
              connect: [{ id: currentUser.id }, { id: otherUser.id }],
            },
          },
        });
        res.status(200).json("conversation created");
      } else {
        res.status(401).json({ errors: errors.array() });
      }
    }),
  ];

  static delete = [
    passport.authenticate("jwt", { session: false }),
    expressAsyncHandler(async (req: Request, res: Response) => {
      const conversationId = req.params.conversationid;

      await prisma.conversation.delete({
        where: {
          id: conversationId,
        },
      });

      res.status(200).json("conversation deleted");
    }),
  ];

  static getCurrentUserConversations = [
    passport.authenticate("jwt", { session: false }),
    expressAsyncHandler(async (req: Request, res: Response) => {
      const { id: userid } = req.user as User;

      const conversations = await prisma.conversation.findMany({
        where: {
          users: {
            some: {
              id: userid,
            },
          },
        },
        include: {
          messages: true,
        },
      });

      res.status(200).json(conversations);
    }),
  ];

  static getById = [
    passport.authenticate("jwt", { session: false }),
    expressAsyncHandler(async (req: Request, res: Response) => {
      const conversationid = req.params.conversationid;

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationid,
        },
        include: {
          messages: true,
        },
      });

      res.status(200).json(conversation);
    }),
  ];
}

export default ConversationController;
