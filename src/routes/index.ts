import express, { Request, Response } from "express";
import Auth from "../controllers/auth-controller";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json("index");
});

router.post("/signup", Auth.signup);
router.post("/login" ,Auth.login)

export default router;
