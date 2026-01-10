import expressAsyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import { CookieOptions, NextFunction, Request, Response } from "express";
import passport from "passport";
import { type User } from "@chat/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@chat/db";
import { AvatarGenerator } from "random-avatar-generator";
import { io } from "../server.js";
import { LoginRequest, SignupRequest } from "@chat/shared";

const generator = new AvatarGenerator();

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: "/",
};

class Auth {
  static signup = expressAsyncHandler(async (req: Request, res: Response) => {
    const data = SignupRequest.parse(req.body);

    const exists = await prisma.user.findUnique({
      where: {
        name: data.username,
      },
    });

    if (exists) {
      res.status(409).json({ message: "Username already exists" });
      return;
    }

    const hash = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
      data: {
        name: data.username,
        password: hash,
        imgUrl: generator.generateRandomAvatar(),
      },
    });

    res.status(200).json({ message: "User account creation sucess", data });
  });

  static login = [
    expressAsyncHandler(
      async (req: Request, res: Response, next: NextFunction) => {
        const data = LoginRequest.parse(req.body);

        const user = await prisma.user.findUnique({
          where: {
            name: data.username,
          },
        });

        if (!user) {
          res.status(401).json({ message: "Invalid credentials" });
          return;
        }

        const matches = await bcrypt.compare(data.password, user.password);

        if (!matches) {
          res.status(401).json({ message: "Invalid credentials" });
          return;
        }

        const token = jwt.sign({ id: user.id }, process.env.SECRET, {
          expiresIn: "3d",
        });

        res.cookie("jwt", token, cookieOptions);

        res.status(200).json({ message: "Login sucess" });
      },
    ),
  ];

  static logout = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    expressAsyncHandler(async (req: Request, res: Response) => {
      const { id: userId } = req.user as User;
      res.cookie("jwt", "", cookieOptions);
      io.in(`user:${userId}`).disconnectSockets(true);
      res.status(200).json("logout sucess");
    }),
  ];
}

export default Auth;
