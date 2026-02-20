import { User } from "@chat/db/client";
import passport from "passport";
import { prisma } from "@chat/db/client";
import { createHandler } from "../lib/create-handler.js";
import { Routes } from "@chat/shared";

class UserController {
  static getCurrent = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    createHandler(Routes.getCurrentUser, async (req) => {
      const { id, name, imgUrl, bio } = req.user as User;
      return { code: 200, message: "Success", data: { id, name, imgUrl, bio } };
    }),
  ];

  static getUserById = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    createHandler(Routes.getUserById, async (req) => {
      const { id } = req.params;
      console.log(id);

      const user = await prisma.user.findFirst({
        where: {
          id: id,
        },
        omit: {
          password: true,
        },
        include: {
          blocked: true,
          blockedBy: true,
          messages: true,
          bookmarks: true,
          conversations: true,
        },
      });

      return { code: 200, message: "Success", data: user };
    }),
  ];

  static getBookmarks = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    createHandler(Routes.getBookmarks, async (req, res) => {
      const { id: userid } = req.user as User;

      const user = await prisma.user.findFirst({
        select: {
          id: true,
          imgUrl: true,
          name: true,
          bio: true,
          bookmarks: {
            include: {
              author: {
                select: {
                  id: true,
                  imgUrl: true,
                  name: true,
                  bio: true,
                },
              },
            },
          },
        },

        where: {
          id: userid,
        },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const bookmarks = user.bookmarks.map(
        ({ author, id, body, createdAt, status, conversationId, authorId }) => {
          const isMine = author.id === userid;
          return {
            id,
            body,
            author,
            createdAt,
            isMine,
            isBookmarked: true,
            status,
            conversationId,
            authorId,
          };
        },
      );
      return { code: 200, message: "Success", data: bookmarks };
    }),
  ];
  static getMany = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    createHandler(Routes.getUsers, async (req) => {
      const currentUser = req.user as User;
      const users = await prisma.user.findMany({
        select: {
          id: true,
          imgUrl: true,
          name: true,
          bio: true,
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
          hasConversation: !!conversation?.id,
          mutualConversation: conversation?.id,
        };
      });

      return { code: 200, message: "Success ", data: mappedUsers };
    }),
  ];

  static blockUser = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    createHandler(Routes.blockUser, async (req) => {
      const user = req.user as User;
      const blockedId = req.params.id;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          blocked: {
            connect: [{ id: blockedId }],
          },
        },
      });

      return { code: 200, message: "successfully blocked user" };
    }),
  ];
}

export default UserController;
