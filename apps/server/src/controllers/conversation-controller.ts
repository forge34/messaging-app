import { User } from "@chat/db/client";
import passport from "passport";
import { prisma } from "@chat/db/client";
import { createHandler } from "../lib/validate.js";
import { Routes } from "@chat/shared";

class ConversationController {
  static create = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    createHandler(Routes.createConversation, async (req) => {
      const otherUser = await prisma.user.findUnique({
        where: {
          id: req.body.otherId,
        },
      });
      const currentUser = req.user as User;

      const conversation = await prisma.conversation.create({
        data: {
          users: {
            connect: [{ id: currentUser.id }, { id: otherUser.id }],
          },
        },
      });
      return { code: 200, message: "conversation created", data: conversation };
    }),
  ];

  static delete = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    createHandler(Routes.deleteConversation, async (req) => {
      const conversationId = String(req.params.id);

      await prisma.conversation.delete({
        where: {
          id: conversationId,
        },
      });

      return { code: 200, message: "conversation deleted" };
    }),
  ];

  static getCurrentUserConversations = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    createHandler(Routes.getCurrentUserConversations, async (req) => {
      const { id: userid } = req.user as User;
      const conversations = await prisma.conversation.findMany({
        where: {
          users: { some: { id: userid } },
        },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          messages: {
            select: {
              id: true,
              body: true,
              authorId: true,
              conversationId: true,
              author: { select: { id: true, name: true, imgUrl: true } },
            },
          },
          users: {
            select: { id: true, name: true, imgUrl: true },
          },
        },
      });

      const filteredConversations = conversations.map((conversation) => {
        const otherUser = conversation.users.find((user) => user.id !== userid);
        return {
          ...conversation,
          title: otherUser?.name ?? "Conversation",
        };
      });
      return { code: 200, message: "success", data: filteredConversations };
    }),
  ];

  static getById = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    createHandler(Routes.getConversationById, async (req) => {
      const conversationid = String(req.params.id);
      const { id: userid } = req.user as User;

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationid,
        },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          messages: {
            select: {
              id: true,
              body: true,
              authorId: true,
              conversationId: true,
              author: { select: { id: true, name: true, imgUrl: true } },
            },
          },
          users: {
            select: { id: true, name: true, imgUrl: true },
          },
        },
      });
      const otherUser = conversation.users.find((user) => user.id !== userid);
      return {
        code: 200,
        message: "success",
        data: { ...conversation, title: otherUser.name ?? "Conversation" },
      };
    }),
  ];
}

export default ConversationController;
