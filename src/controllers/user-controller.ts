import { PrismaClient, User } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

class UserController {
  static getMany = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    const currentUser = req.user as User;
    const news: any = [];

    for (let user of users) {
      if (user.id === currentUser.id) continue;

      const participants = await prisma.participants.findFirst({
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

      if (participants) {
        news.push({ ...user, relatedToCurrent: true });
      } else {
        news.push({ ...user, relatedToCurrent: false });
      }
    }
    res.status(200).json(news);
  };
}

export default UserController;
