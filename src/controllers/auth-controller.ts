import expressAsyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import type { User } from "@prisma/client";
import jwt from "jsonwebtoken";

const login = [
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
  passport.authenticate("local"),
  (req: Request, res: Response) => {
    const currentUser = req.user as User;
    const token = jwt.sign({ id: currentUser.id }, process.env.SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200);
  },
];
