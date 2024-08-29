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
import { PrismaClient, User } from "@prisma/client";
import { createServer } from "http";
import { Server } from "socket.io";
import cookie from "cookie";

const app: Express = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

const corsOptions: CorsOptions = {
  origin: ["http://localhost:5173" , process.env.CLIENT_URL],
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

const io = new Server(server, {
  cors: corsOptions,
});

io.engine.use((req: any, res: any, next: any) => {
  req.cookies = {};
  req.cookies.jwt = cookie.parse(req.headers.cookie).jwt;
  const isHandshake = req._query.sid === undefined;
  if (isHandshake) {
    passport.authenticate("jwt", { session: false })(req, res, next);
  } else {
    next();
  }
});

io.on("connection", (socket) => {
  const req = socket.request as any;
  const user = req.user as User;

  console.log(`${user.name} connected`);

  socket.join(`user:${user.id}`);
  socket.on("disconnect", () => {
    console.log(`${user.name} disconnected`);
  });
});

server.listen(port, () => {
  console.log(`server running at localhost:${port}`);
});

export { prismaClient, app, io };
