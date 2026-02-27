import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import router from "./routes/index.js";
import { PassportConfig } from "./config/passport.js";
import passport from "passport";
import { pinoHttp } from "pino-http";
import compression from "compression";
import z, { ZodError } from "zod";
import { logger } from "./lib/logger.js";
const app: Express = express();

export const corsOptions: CorsOptions = {
  origin: ["http://localhost:5173", process.env.CLIENT_URL || ""],
  credentials: true,
  allowedHeaders: ["Content-type"],
};
app.use(pinoHttp(logger));
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

PassportConfig.configJwt();
app.use(passport.initialize());

app.use("/", router);

app.use((err: any, req: Request, res: Response, _: NextFunction) => {
  console.log(err);
  if (err instanceof ZodError) {
    const errors = z.flattenError(err);
    return res
      .status(400)
      .json({ messages: errors.formErrors, fields: errors.fieldErrors });
  }
  if (err.name === "AuthenticationError") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.status(500).json({ message: err.message });
});

export { app };
