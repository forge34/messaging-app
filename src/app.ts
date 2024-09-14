import "dotenv/config";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import express, { Express } from "express";
import morgan from "morgan";
import router from "./routes/index";
import { PassportConfig } from "./config/passport";
import passport from "passport";
import { SessionOptions } from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import expressSession from "express-session";
import { PrismaClient } from "@prisma/client";

const app: Express = express();

export const corsOptions: CorsOptions = {
  origin: ["http://localhost:5173", process.env.CLIENT_URL],
  credentials: true,
  allowedHeaders: ["Content-type"],
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const prismaClient = new PrismaClient();

const session: SessionOptions = {
  name: "session",
  resave: false,
  saveUninitialized: true,
  secret: process.env.SECRET,
  cookie: {
    maxAge: 604800000,
  },
  store: new PrismaSessionStore(prismaClient, {
    checkPeriod: 2 * 60 * 1000, //ms
    dbRecordIdIsSessionId: true,
  }),
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  session.cookie.httpOnly = true;
  session.cookie.secure = true;
  session.cookie.sameSite = "none";
}
app.use(expressSession(session));

PassportConfig.configLocal();
PassportConfig.configJwt();
app.use(passport.initialize());
app.use(passport.session());

app.use("/", router);

export { prismaClient, app };
