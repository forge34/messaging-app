import express, { Request, Response  } from "express";
import Auth from "../controllers/auth-controller.js";
import MessagesController from "../controllers/messages-controller.js";
import ConversationController from "../controllers/conversation-controller.js";
import UserController from "../controllers/user-controller.js";

const router = express.Router();

router.get("/", (_: Request, res: Response) => {
  res.json("index");
});

router.post("/signup", Auth.signup);
router.post("/login", Auth.login);
router.post("/logout", Auth.logout);

router.post("/conversation", ConversationController.create);
router.delete("/conversation/:conversationid", ConversationController.delete);
router.get(
  "/conversation/currentUser",
  ConversationController.getCurrentUserConversations,
);
router.get("/conversation/:conversationid", ConversationController.getById);

router.post("/message/:messageid/bookmark", MessagesController.bookmarkMessage);

router.get("/users", UserController.getMany);
router.get("/users/bookmarks", UserController.getBookmarks);
router.get("/users/me", UserController.getCurrent);
router.post("/users/:userid/block", UserController.blockUser);

export default router;
