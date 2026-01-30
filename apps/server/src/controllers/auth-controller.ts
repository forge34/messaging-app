import { CookieOptions } from "express";
import passport from "passport";
import { type User } from "@chat/db/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@chat/db/client";
import { AvatarGenerator } from "random-avatar-generator";
import { io } from "../server.js";
import { createHandler } from "../lib/validate.js";
import { Routes } from "@chat/shared";

const generator = new AvatarGenerator();

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: "/",
};

class Auth {
  static signup = createHandler(Routes.signup, async (req, res) => {
    const data = req.body;
    const exists = await prisma.user.findUnique({
      where: {
        name: data.username,
      },
    });

    if (exists) {
      res.status(409).json({ code: 409, message: "Username already exists" });
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
    return { code: 200, message: "User account created successfully" };
  });

  static login = createHandler(Routes.login, async (req, res) => {
    const data = req.body;

    const user = await prisma.user.findUnique({
      where: {
        name: data.username,
      },
    });

    if (!user) {
      res.status(401).json({ code: 401, message: "Invalid credentials" });
      return;
    }

    const matches = await bcrypt.compare(data.password, user.password);

    if (!matches) {
      res.status(401).json({ code: 401, message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: user.id }, process.env.SECRET || "", {
      expiresIn: "3d",
    });

    res.cookie("jwt", token, cookieOptions);

    return { code: 200, message: "Login sucess" };
  });

  static logout = [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    createHandler(Routes.logout, async (req, res) => {
      const { id: userId } = req.user as User;
      res.cookie("jwt", "", cookieOptions);
      io.in(`user:${userId}`).disconnectSockets(true);
      return { code: 200, message: "logout sucess" };
    }),
  ];
}

export default Auth;
