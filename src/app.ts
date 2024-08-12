import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import { configDotenv } from "dotenv";
import express, { Express } from "express";
import morgan from "morgan";
import router from "./routes/index";
import { PassportConfig } from "./config/passport";
import passport from "passport";
import { SessionOptions } from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import expressSession from "express-session";
import { PrismaClient } from "@prisma/client";

configDotenv();
const app: Express = express();
const port = process.env.PORT || 3000;

const corsOptions: CorsOptions = {
  origin: [" http://localhost:5173"],
  credentials: true,
  allowedHeaders: ["Content-type"],
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const session: SessionOptions = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.SECRET,
  cookie: {
    maxAge: 604800000,
  },
  store: new PrismaSessionStore(new PrismaClient(), {
    checkPeriod: 2 * 60 * 1000, //ms
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
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
app.use(passport.initialize());
app.use(passport.session())

app.use("/", router);

app.listen(port, () => {});
