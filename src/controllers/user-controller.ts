import { Conversation, User } from "@prisma/client";
import {  Request, Response } from "express";
import passport from "passport";
import { prisma } from "../config/prisma-client";
import expressAsyncHandler from "express-async-handler";

interface IUser extends Omit<User, "password"> {
  relatedToCurrent: boolean;
  privateConversation: Conversation | null;
}

class UserController {
  static getCurrent = [
    passport.authenticate("jwt", { session: false }),
    expressAsyncHandler(async (req: Request, res: Response) => {
      res.status(200).json(req.user as User);
    }),
  ];

  static getMany = [
    passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
      const users = await prisma.user.findMany({});
      const currentUser = req.user as User;
      const filteredUsers: IUser[] = [];

      for (let user of users) {
        if (user.id === currentUser.id) continue;

        const privateConversation = await prisma.conversation.findFirst({
          where: {
            AND: [
              {
                users: {
                  some: {
                    id: currentUser.id,
                  },
                },
              },
              {
                users: {
                  some: {
                    id: user.id,
                  },
                },
              },
            ],
          },
        });

        const { password, ...rest } = user;
        if (privateConversation) {
          filteredUsers.push({
            ...rest,
            privateConversation,
            relatedToCurrent: true,
          });
        } else {
          filteredUsers.push({
            ...rest,
            privateConversation: null,
            relatedToCurrent: false,
          });
        }
      }
      res.status(200).json(filteredUsers);
    },
  ];

  static blockUser = [
    passport.authenticate("jwt", { session: false }),
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
