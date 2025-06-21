import "dotenv/config";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import router from "./routes/index";
import { PassportConfig } from "./config/passport";
import passport from "passport";

import compression from "compression";

const app: Express = express();

export const corsOptions: CorsOptions = {
  origin: ["http://localhost:5173", process.env.CLIENT_URL],
  credentials: true,
  allowedHeaders: ["Content-type"],
};

app.use(compression());
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

PassportConfig.configLocal();
PassportConfig.configJwt();
app.use(passport.initialize());

app.use("/", router);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  if (err.name === "AuthenticationError") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.status(err.code || 500).json({ message: err.message });
});

export { app };
