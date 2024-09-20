import expressAsyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import { CookieOptions, NextFunction, Request, Response } from "express";
import passport from "passport";
import { type User } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma-client";
import { AvatarGenerator } from "random-avatar-generator";

const generator = new AvatarGenerator();

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: "/",
};

class Auth {
  static signup = [
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
    body("confirmPassword")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password should be at least 8 characters")
      .custom((value, { req }) => {
        return value === req.body.password;
      })
      .escape(),

    expressAsyncHandler(async (req: Request, res: Response) => {
      const errors = validationResult(req);

      if (errors.isEmpty()) {
        bcrypt.hash(req.body.password, 10, async (err, hash) => {
          if (!err) {
            await prisma.user.create({
              data: {
                name: req.body.username,
                password: hash,
                imgUrl: generator.generateRandomAvatar(),
              },
            });
            res.status(200).json("created user");
          } else if (err) {
            res.status(401);
          }
        });
      } else {
        res.status(401).json({ errors: errors.array() });
      }
    }),
  ];

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
    passport.authenticate("local", { failWithError: true }),
    (req: Request, res: Response) => {
      const currentUser = req.user as User;
      const token = jwt.sign({ id: currentUser.id }, process.env.SECRET, {
        expiresIn: "7d",
      });

      res.cookie("jwt", token, cookieOptions);

      res.status(200).json("Login sucess");
    },
    (err: Error, req: Request, res: Response, next: NextFunction) => {
      res.status(401).json(err);
    },
  ];

  static logout = expressAsyncHandler(async (req: Request, res: Response) => {
    res.clearCookie("jwt", cookieOptions);
    req.logout((err) => {
      if (err) res.status(500).json("internal server error");
    });
    res.status(200).json("logout sucess");
  });
}

export default Auth;
