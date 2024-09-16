import passport from "passport";
import cookie from "cookie"

export const socketJwtVerify = (req: any, res: any, next: any) => {
  if (!req.headers.cookie) return;
  req.cookies = {};
  req.cookies.jwt = cookie.parse(req.headers.cookie).jwt;
  const isHandshake = req._query.sid === undefined;
  if (isHandshake) {
    passport.authenticate("jwt", { session: false })(req, res, next);
  } else {
    next();
  }
}
