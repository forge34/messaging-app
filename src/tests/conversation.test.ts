import request from "supertest";
import { app } from "../app";
import { tokenString } from "./setup";
import { Conversation } from "@prisma/client";

describe("POST /conversation ", () => {
  describe("given valid JWT", () => {
    test("returns code 200", async () => {
      const res = await request(app)
        .post("/conversation")
        .set("Cookie", tokenString)
        .send({ otherId: "cm13qq17b000008l80a935uq7" })
        .set("Content-Type", "application/json")
        .set("Accept", "application/json");

      expect(res.statusCode).toEqual(200);
    });

    test("creates a conversation ", async () => {
      const res = await request(app)
        .post("/conversation")
        .set("Cookie", tokenString)
        .send({ otherId: "cm13qq17b000008l80a935uq7" })
        .set("Content-Type", "application/json")
        .set("Accept", "application/json");

      const resBody = res.body.conversation as Conversation;
      expect(resBody.id).toBeDefined();
    });

    test("creates a conversation with a title", async () => {
      const res = await request(app)
        .post("/conversation")
        .set("Cookie", tokenString)
        .send({
          otherId: "cm13qq17b000008l80a935uq7",
          title: "this is a title",
        })

        .set("Content-Type", "application/json")
        .set("Accept", "application/json");

      const resBody = res.body.conversation as Conversation;
      expect(resBody.title).toMatch("this is a title");
    });
  });
  describe("given invalid jwt", () => {
    test("returns code 401", async () => {
      const res = await request(app).post("/conversation");

      expect(res.statusCode).toEqual(401);
    });
  });
});

describe("DELETE /conversation", () => {
  describe("given a valid JWT", () => {
    test("returns code 200", async () => {
      const res = await request(app)
        .delete("/conversation/cm1996epp000208mic322962e")
        .set("Cookie", tokenString);

      expect(res.statusCode).toEqual(200);
    });
  });

  describe("given invalid jwt", () => {
    test("returns code 401", async () => {
      const res = await request(app).delete(
        "/conversation/cm1996epp000208mic322962e",
      );

      expect(res.statusCode).toEqual(401);
    });
  });
});

describe("GET /conversation/currentUser", () => {
  describe("given a valid jwt", () => {
    test("returns code 200", async () => {
      const res = await request(app)
        .get("/conversation/currentUser")
        .set("Cookie", tokenString);

      expect(res.statusCode).toEqual(200);
    });

    test("returns number of user conversations", async () => {
      const res = await request(app)
        .get("/conversation/currentUser")
        .set("Cookie", tokenString);

      expect(res.body.length).toEqual(1);
      expect(res.body[0].id).toBeDefined();
    });
  });
  describe("given invalid jwt", () => {
    test("returns code 401", async () => {
      const res = await request(app).get("/conversation/currentUser");

      expect(res.statusCode).toEqual(401);
    });
  });
});

describe("GET /conversation/conversationid", () => {
  describe("given valid jwt", () => {
    test("returns code 200", async () => {
      const id = "cm1996epp000208mic322962e";

      const res = await request(app)
        .get(`/conversation/${id}`)
        .set("Cookie", tokenString);
      expect(res.statusCode).toEqual(200);
    });
    test("returns correct conversation", async () => {
      const id = "cm1996epp000208mic322962e";

      const res = await request(app)
        .get(`/conversation/${id}`)
        .set("Cookie", tokenString);

      expect(res.body.id).toEqual(id);
    });
  });

  describe("given invalid jwt", () => {
    test("returns code 401", async () => {
      const id = "cm1996epp000208mic322962e";

      const res = await request(app).get(`/conversation/${id}`);

      expect(res.statusCode).toEqual(401);
    });
  });
});
