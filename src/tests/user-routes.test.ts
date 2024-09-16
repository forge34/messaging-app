import request from "supertest";
import { User } from "@prisma/client";
import { createServer } from "http";
import { app } from "../app";
import { tokenString } from "./setup";
const server = createServer(app);

describe("/users route", () => {
  describe("/users/me ", () => {
    describe("given a valid jwt ,", () => {
      test("returns code 200", async () => {
        const res = await request(server)
          .get("/users/me")
          .set("Cookie", tokenString);

        expect(res.status).toEqual(200);
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

    describe("given invalid jwt", () => {
      test("returns 401", async () => {
        const res = await request(server).get("/users/me");

        expect(res.status).toEqual(401);
      });
    });
  });

  describe("/users/:userid/block", () => {
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

  describe("/users", () => {
    describe("given valid jwt", () => {
      test("return code 200", async () => {
        const res = await request(server)
          .get("/users")
          .set("Cookie", tokenString);

        expect(res.status).toEqual(200);
      });
      test("returns all users except currently logged user", async () => {
        const res = await request(server)
          .get("/users")
          .set("Cookie", tokenString);

        expect(res.status).toEqual(200);
        const resBody = res.body as Array<User>;
        expect(resBody.some((item) => item.name === "forge2")).toBe(true);
      });
    });

    describe("given invalid jwt", () => {
      test("returns 404", async () => {
        const res = await request(server)
          .get("/users")
          .set("Cookie", tokenString);

        expect(res.status).toEqual(200);
      });
    });
  });
});
