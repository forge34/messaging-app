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
import { SignupRequest } from "@chat/shared";

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
    body("username")
      .trim()
      .isLength({ min: 1 })
      .withMessage("username is too short")
      .escape(),
    body("password")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password should be at least 8 characters")
      .escape(),
    expressAsyncHandler(
      async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);

        if (errors.isEmpty()) {
          next();
        } else {
          res.status(401).json({ errors: errors.array() });
        }
      },
    ),
    expressAsyncHandler(
      async (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate(
          "local",
          { session: false, failWithError: true },
          (err: any, user: any) => {
            if (err) {
              return next(err);
            }

            if (!user) {
              const error = {
                code: 401,
                message: "Authentication failed",
              };
              next(error);
            } else {
              const currentUser = user as User;
              const token = jwt.sign(
                { id: currentUser.id },
                process.env.SECRET,
                {
                  expiresIn: "3d",
                },
              );

              res.cookie("jwt", token, cookieOptions);

              res.status(200).json("Login sucess");
            }
          },
        )(req, res, next);
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
