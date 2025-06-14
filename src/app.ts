import "dotenv/config";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import router from "./routes/index";
import { PassportConfig } from "./config/passport";
import passport from "passport";

import compression from "compression";

interface RouteError extends Error {
  statusCode?: number;
  message: string;
}

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

app.use((err: RouteError, req: Request, res: Response, next: NextFunction) => {
  console.log(err)
  res.status(err.statusCode || 500).json(err.message);
});

export { app };
