import { PrismaClient, User } from "@prisma/client";
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
      });

      done(null, user);
    });
    passport.use(localStrategy);
  }
}

export { PassportConfig };
