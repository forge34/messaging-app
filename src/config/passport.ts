import { PrismaClient } from "@prisma/client";
import passport from "passport";
import passportLocal from "passport-local";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
  }
};

const localStrategy = new passportLocal.Strategy(localVerify);

passport.use(localStrategy);
