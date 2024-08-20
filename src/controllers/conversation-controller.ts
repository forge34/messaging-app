import expressAsyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import { User } from "@prisma/client";
import { Request, Response } from "express";
import passport from "passport";
import { prismaClient } from "../app";

class ConversationController {
  static create = [
    passport.authenticate("jwt", { session: false }),
    body("title").trim().optional().isLength({ min: 1 }).escape(),
    body("otherId").trim().isLength({ min: 1 }).escape(),
    expressAsyncHandler(async (req: Request, res: Response) => {
      const errors = validationResult(req);
      const otherUser = await prismaClient.user.findUnique({
        where: {
          id: req.body.otherId,
        },
      });
      const currentUser = req.user as User;
      console.log(currentUser);
      if (errors.isEmpty()) {
        const conversation = await prismaClient.conversation.create({
          data: {
            title: req.body.title || otherUser.name,
            users: {
              connect: [{ id: currentUser.id }, { id: otherUser.id }],
            },
          },
        });
        res.status(200).json({ msg: "conversation created", conversation });
      } else {
        res.status(401).json({ errors: errors.array() });
      }
    }),
  ];

  static delete = [
    passport.authenticate("jwt", { session: false }),
    expressAsyncHandler(async (req: Request, res: Response) => {
      const conversationId = req.params.conversationid;

      await prismaClient.conversation.delete({
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

      const conversations = await prismaClient.conversation.findMany({
        where: {
          users: {
            some: {
              id: userid,
            },
          },
        },
        include: {
          messages: true,
          users: true,
        },
      });

      res.status(200).json(conversations);
    }),
  ];

  static getById = [
    passport.authenticate("jwt", { session: false }),
    expressAsyncHandler(async (req: Request, res: Response) => {
      const conversationid = req.params.conversationid;
      const currentUser = req.user as User;

      const conversation = await prismaClient.conversation.findFirst({
        where: {
          id: conversationid,
        },
        include: {
          messages: true,
          users: true,
        },
      });

      const conversationWithOwn = {
        ...conversation,
        messages: conversation.messages.map((message) => {
          return {
            ...message,
            ownMessage: currentUser.id === message.authorId,
          };
        }),
      };
      res.status(200).json(conversationWithOwn);
    }),
  ];
}

export default ConversationController;
