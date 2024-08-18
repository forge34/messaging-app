import {  User } from "@prisma/client";
import { Request, Response } from "express";
import passport from "passport";
import { prismaClient } from "../app";

interface IUser extends Omit<User, "password"> {
  relatedToCurrent: boolean;
}


class UserController {
  static getMany = [
    passport.authenticate("jwt", { session: false }),
    async (req: Request, res: Response) => {
      const users = await prismaClient.user.findMany({});
      const currentUser = req.user as User;
      const filteredUsers: IUser[] = [];

      for (let user of users) {
        if (user.id === currentUser.id) continue;

        const privateConversation = await prismaClient.conversation.findFirst({
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
          filteredUsers.push({ ...rest, relatedToCurrent: true });
        } else {
          filteredUsers.push({ ...rest, relatedToCurrent: false });
        }
      }
      res.status(200).json(filteredUsers);
    },
  ];
}

export default UserController;
