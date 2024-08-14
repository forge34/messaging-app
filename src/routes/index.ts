import express, { Request, Response } from "express";
import Auth from "../controllers/auth-controller";
import MessagesController from "../controllers/messages-controller";
import ConversationController from "../controllers/conversation-controller";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json("index");
});

router.post("/signup", Auth.signup);
router.post("/login", Auth.login);

router.post("/conversation", ConversationController.create);
router.post("/conversation/:conversationid", MessagesController.createMessage);
router.delete("/conversation/:conversationid", ConversationController.delete);

router.delete("/messages/:messageid", MessagesController.deleteMessage);

export default router;
