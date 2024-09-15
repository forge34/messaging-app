import request from "supertest";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { createServer } from "http";
import { app } from "../app";
const server = createServer(app);

const token = jwt.sign(
  { id: "cm13m1xlm000108m8dwe25r9k" },
  process.env.SECRET,
  {
    expiresIn: "7d",
  },
);

const tokenString = `jwt=${token}`;


describe("user GET routes", () => {
  test("returns all users except currently logged user", async () => {
    const res = await request(server).get("/users").set("Cookie", tokenString);

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toEqual(200);
    const resBody = res.body as Array<User>;
    expect(resBody.some((item) => item.name === "forge2")).toBe(true);
  });

  test("returns logged user", async () => {
    const res = await request(server)
      .get("/users/me")
      .set("Cookie", tokenString);

    const resBody = res.body as User;

    expect(res.status).toEqual(200);
    expect(resBody.name).toMatch("forge");
  });
});

describe("user POST routes", () => {
  test("blocks user", async () => {
    const res = await request(server)
      .post("/users/cm13qq17b000008l80a935uq7/block")
      .set("Cookie", tokenString);

    expect(res.status).toEqual(200);

    const res2 = await request(server)
      .get("/users/me")
      .set("Cookie", tokenString);

    const user = res2.body as User & { blocked: Array<User> };

    expect(
      user.blocked.some((blockedUser) => blockedUser.name === "forge2"),
    ).toBe(true);
  });
});
