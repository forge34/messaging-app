import express, { Request, Response } from "express";
import Auth from "../controllers/auth-controller";
import MessagesController from "../controllers/messages-controller";
import ConversationController from "../controllers/conversation-controller";
import UserController from "../controllers/user-controller";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json("index");
});

router.post("/signup", Auth.signup);
router.post("/login", Auth.login);

router.post("/conversation", ConversationController.create);
router.post("/conversation/:conversationid", MessagesController.createMessage);
router.delete("/conversation/:conversationid", ConversationController.delete);
router.get(
  "/conversation/currentUser",
  ConversationController.getCurrentUserConversations,
);
router.get("/conversation/:conversationid", ConversationController.getById);

router.delete("/messages/:messageid", MessagesController.deleteMessage);

router.get("/users", UserController.getMany);
router.get("/users/me" , UserController.getCurrent)

export default router;
