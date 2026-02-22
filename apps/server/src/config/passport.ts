import passport from "passport";
import { Request } from "express";
import passportJwt from "passport-jwt";
import { prisma } from "@chat/db/client";

const cookieExtractor = (req: Request) => {
  let jwt = null;
  if (req && req.cookies) {
    jwt = req.cookies["jwt"];
  }

  return jwt;
};

class PassportConfig {
  static configJwt() {
    const jwtOptions: passportJwt.StrategyOptionsWithSecret = {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.SECRET,
    };
    const jwtStrategy = new passportJwt.Strategy(
      jwtOptions,
      async (payload, done) => {
        const user = await prisma.user.findFirst({
          where: {
            id: payload.id,
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
