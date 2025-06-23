import { User } from "@prisma/client";
import { Request, Response } from "express";
import passport from "passport";
import { prisma } from "../config/prisma-client";
import expressAsyncHandler from "express-async-handler";

class UserController {
  static getCurrent = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    expressAsyncHandler(async (req: Request, res: Response) => {
      res.status(200).json(req.user as User);
    }),
  ];

  static getBookmarks = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    expressAsyncHandler(async (req: Request, res: Response) => {
      const { id } = req.user as User;

      const user = await prisma.user.findFirst({
        include: {
          bookmarks: {
            include: {
              author: true,
              conversation: true,
            },
          },
        },
        where: {
          id: id,
        },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const { bookmarks } = user;

      res.status(200).json(bookmarks);
    }),
  ];
  static getMany = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    async (req: Request, res: Response) => {
      const currentUser = req.user as User;
      const users = await prisma.user.findMany({
        select: {
          id: true,
          imgUrl: true,
          name: true,
        },
      });

      const conversations = await prisma.conversation.findMany({
        include: {
          users: true,
        },
      });

      const mappedUsers = users.map((u) => {
        const conversation = conversations.find((c) => {
          return (
            c.users.some((u1) => u1.id === u.id) &&
            c.users.some((u2) => u2.id === currentUser.id)
          );
        });

        return {
          ...u,
          isCurrent: u.id === currentUser.id,
          conversationId: conversation?.id ?? null,
        };
      });

      res.status(200).json(mappedUsers);
    },
  ];

  static blockUser = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    expressAsyncHandler(async (req: Request, res: Response) => {
      const user = req.user as User;
      const blockedId = req.params.userid as string;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          blocked: {
            connect: [{ id: blockedId }],
          },
        },
      });

      res.status(200).json("successfully blocked user");
    }),
  ];
}

export default UserController;
