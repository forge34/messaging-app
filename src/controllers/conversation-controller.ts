import expressAsyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import { PrismaClient, User } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

class ConversationController {
  static create = [
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
            participants: {
              create: {
                users: {
                  connect: [{ id: currentUser.id }, { id: otherUser.id }],
                },
              },
            },
          },
        });
        res.status(200).json("conversation created");
      } else {
        res.status(401).json({ errors: errors.array() });
      }
    }),
  ];

  static delete = expressAsyncHandler(async (req: Request, res: Response) => {
    const conversationId = req.params.conversationid;

    await prisma.conversation.delete({
      where: {
        id: conversationId,
      },
    });

    res.status(200).json("conversation deleted");
  });
}

export default ConversationController;
