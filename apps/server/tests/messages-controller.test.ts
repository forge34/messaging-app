import { prisma } from "@chat/db/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import request from "supertest";
import { app } from "../src/app.js";
import { describe, beforeEach, it, expect } from "vitest";

const SECRET = process.env.SECRET!;
let userId: string;
let token: string;
let message;

describe("POST /message/:messageid/bookmark", () => {
  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        id: "2m",
        name: "JwtUserm",
        password: hashedPassword,
        imgUrl: "dummy",
      },
    });

    userId = user.id;

    token = jwt.sign({ id: userId }, SECRET, { expiresIn: "1h" });

    message = await prisma.message.create({
      data: {
        id: "1",
        authorId: user.id,
        body: "test message",
      },
    });
  });

  it("should bookmark given a valid message id", async () => {
    const res = await request(app)
      .post("/message/1/bookmark")
      .set("Cookie", [`jwt=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("message bookmarked");
  });

  it("should fail given a invalid jwt", async () => {
    const res = await request(app)
      .post("/message/1/bookmark")
      .set("Cookie", [`jwt=invalid`]);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  it("should fail given a invalid message id", async () => {
    const res = await request(app)
      .post("/message/invalid-id/bookmark")
      .set("Cookie", [`jwt=${token}`]);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("message not found");
  });
});
