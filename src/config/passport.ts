import { User } from "@prisma/client";
import passport from "passport";
import passportLocal from "passport-local";
import bcrypt from "bcryptjs";
import { Request } from "express";
import passportJwt from "passport-jwt";
import { prisma } from "../config/prisma-client";

const localVerify: passportLocal.VerifyFunction = async (
  username,
  password,
  done,
) => {
  const user = await prisma.user.findFirst({
    where: {
      name: username,
    },
  });

  if (!user) {
    return done("User not found", false);
  }

  const match = await bcrypt.compare(password, user.password);

  if (match) {
    return done(null, user);
  } else if (!match) {
    return done("Invalid username or password", false);
  }
};

const cookieExtractor = (req: Request) => {
  let jwt = null;
  if (req && req.cookies) {
    jwt = req.cookies["jwt"];
  }

  return jwt;
};

const jwtOptions: passportJwt.StrategyOptionsWithSecret = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.SECRET,
};

class PassportConfig {
  static configLocal() {
    const localStrategy = new passportLocal.Strategy(localVerify);

    passport.serializeUser((user: User, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
      const user = await prisma.user.findFirst({
        where: {
          id: id,
        },
        include: {
          messages: true,
          blocked: true,
        },
      });

      done(null, user);
    });
    passport.use(localStrategy);
  }

  static configJwt() {
    const jwtStrategy = new passportJwt.Strategy(
      jwtOptions,
      async (payload, done) => {
        const user = await prisma.user.findFirst({
          where: {
            id: payload.id,
          },
          include: {
            messages: true,
            blocked: true,
          },
        });

        if (user) {
          return done(null, user);
        } else if (!user) {
          done(null, false);
        }
      },
    );

    passport.use(jwtStrategy);
  }
}

export { PassportConfig };
