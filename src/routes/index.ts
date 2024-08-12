import express, { Request, Response } from "express";
import Auth from "../controllers/auth-controller";
import MessagesController from "../controllers/messages-controller";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json("index");
});

router.post("/signup", Auth.signup);
router.post("/login", Auth.login);

router.post("/:userid/message", MessagesController.createMessage);

export default router;
