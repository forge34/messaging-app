import { User } from "@chat/db/client";
import passport from "passport";
import { prisma } from "@chat/db/client";
import { createHandler } from "../lib/create-handler.js";
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

      const hasConversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            {
              users: {
                some: {
                  id: otherUser.id,
                },
              },
            },
            {
              users: {
                some: {
                  id: currentUser.id,
                },
              },
            },
          ],
        },
      });

      if (hasConversation) {
        return {
          code: 200,
          message: "conversation created",
          data: hasConversation,
        };
      }

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
              status: true,
              createdAt: true,
              authorId: true,
              conversationId: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  imgUrl: true,
                  bio: true,
                },
              },
            },
          },
          users: {
            select: { id: true, name: true, imgUrl: true, bio: true },
          },
        },
      });

      const filteredConversations = conversations.map(
        ({ users, messages, createdAt, updatedAt, id }) => {
          const otherUser = users.find((user) => user.id !== userid);

          const last =
            messages.length > 0 ? messages[messages.length - 1] : null;

          const lastMessage = last
            ? {
                id: last.id,
                body: last.body,
                author: last.author,
                status: last.status,
                createdAt: last.createdAt,
              }
            : null;

          return {
            createdAt,
            updatedAt,
            id,
            users,
            otherUser,
            lastMessage,
            lastMessageAt: lastMessage?.createdAt ?? null,
            title: otherUser?.name ?? "Conversation",
          };
        },
      );
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
              status: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  bio: true,
                  name: true,
                  imgUrl: true,
                },
              },
              bookmarkedBy: true,
              messageReceipts: true,
              messageReactions: true,
            },
          },
          users: {
            select: {
              id: true,
              name: true,
              imgUrl: true,
              bio: true,
              lastSeen: true,
            },
          },
        },
      });
      const otherUser = conversation.users.find((user) => user.id !== userid);
      const mappedMessages = conversation.messages
        .map(
          ({
            id,
            authorId,
            author,
            status,
            createdAt,
            conversationId,
            bookmarkedBy,
            body,
            messageReactions,
            messageReceipts,
          }) => {
            return {
              messageReactions,
              messageReceipts,
              id,
              body,
              author,
              authorId,
              status,
              createdAt,
              conversationId,
              isMine: authorId === userid,
              isBookmarked:
                bookmarkedBy.findIndex(({ id }) => id === userid) >= 0
                  ? true
                  : false,
            };
          },
        )
        .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
      const mapped = {
        ...conversation,
        messages: mappedMessages,
        title: otherUser.name ?? "Conversation",
      };
      return {
        code: 200,
        message: "success",
        data: mapped,
      };
    }),
  ];
}

export default ConversationController;
