import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { app } from "../src/app.js";
import { prisma } from "@chat/db/client";
import { type User } from "@chat/db/client";

const SECRET = process.env.SECRET!;
let userId: string;
let token: string;

const clearDb = async () => {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.user.deleteMany();
};

describe("GET /users/", async () => {
  let otherUser: User;

  beforeEach(async () => {
    await clearDb();

    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        id: "2",
        name: "JwtUser",
        password: hashedPassword,
        imgUrl: "dummy",
      },
    });

    userId = user.id;
    token = jwt.sign({ id: userId }, SECRET, { expiresIn: "1h" });

    otherUser = await prisma.user.create({
      data: {
        id: "1",
        name: "other",
        password: "password123",
        imgUrl: "dummy",
        bio: "Test",
      },
    });
  });

  it("should return all users and correctly identify the current user", async () => {
    const res = await request(app)
      .get("/users")
      .set("Cookie", [`jwt=${token}`]);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);

    const other = res.body.data.find((u: User) => u.id === otherUser.id);
    const main = res.body.data.find((u: User) => u.id === "2");

    expect(main.isCurrent).toBe(true);
    expect(other.isCurrent).toBe(false);
    expect(other.hasConversation).toBe(false);
  });

  it("should set hasConversation=true if a conversation exists", async () => {
    await prisma.conversation.create({
      data: {
        users: {
          connect: [{ id: userId }, { id: otherUser.id }],
        },
      },
    });

    const res = await request(app)
      .get("/users")
      .set("Cookie", [`jwt=${token}`]);

    expect(res.status).toBe(200);
    const other = res.body.data.find((u: User) => u.id === otherUser.id);

    expect(other.hasConversation).toBe(true);
  });

  it("should reject access with no or invalid cookie", async () => {
    const res = await request(app)
      .get("/users/")
      .set("Cookie", [`jwt=invalidtoken`]);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });
});

describe("GET /users/me", () => {
  beforeEach(async () => {
    await clearDb();

    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        id: "2",
        name: "JwtUser",
        password: hashedPassword,
        imgUrl: "dummy",
      },
    });

    userId = user.id;
    token = jwt.sign({ id: userId }, SECRET, { expiresIn: "1h" });
  });

  it("should allow access with jwt cookie", async () => {
    const res = await request(app)
      .get("/users/me")
      .set("Cookie", [`jwt=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: userId,
      name: "JwtUser",
      imgUrl: "dummy",
      bio: "",
    });
  });

  it("should reject access with missing cookie", async () => {
    const res = await request(app).get("/users/me");
    expect(res.status).toBe(401);
  });
});

describe("GET /users/bookmarks", () => {
  let otherUserId: string;

  beforeEach(async () => {
    await clearDb();

    const hashedPassword = await bcrypt.hash("password123", 10);

    const user = await prisma.user.create({
      data: { name: "Me", password: hashedPassword, imgUrl: "dummy" },
    });
    userId = user.id;
    token = jwt.sign({ id: userId }, SECRET, { expiresIn: "1h" });

    const other = await prisma.user.create({
      data: { name: "Other", password: hashedPassword, imgUrl: "dummy" },
    });
    otherUserId = other.id;
  });

  it("should return empty list if user has no bookmarks", async () => {
    const res = await request(app)
      .get("/users/bookmarks")
      .set("Cookie", [`jwt=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("should return bookmarked messages with correct mapping", async () => {
    const conversation = await prisma.conversation.create({
      data: {
        users: { connect: [{ id: userId }, { id: otherUserId }] },
      },
    });

    const message = await prisma.message.create({
      data: {
        body: "Hello World",
        authorId: otherUserId,
        conversationId: conversation.id,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        bookmarks: { connect: [{ id: message.id }] },
      },
    });

    const res = await request(app)
      .get("/users/bookmarks")
      .set("Cookie", [`jwt=${token}`]);

    console.log(res)

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);

    const bookmark = res.body.data[0];
    expect(bookmark.body).toBe("Hello World");
    expect(bookmark.isBookmarked).toBe(true);
    expect(bookmark.isMine).toBe(false); // Author is otherUser
    expect(bookmark.author.id).toBe(otherUserId);
  });

  it("should correctly flag 'isMine' if I bookmarked my own message", async () => {
    const conversation = await prisma.conversation.create({
      data: {
        users: { connect: [{ id: userId }, { id: otherUserId }] },
      },
    });

    const message = await prisma.message.create({
      data: {
        body: "My own message",
        authorId: userId,
        conversationId: conversation.id,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { bookmarks: { connect: [{ id: message.id }] } },
    });

    const res = await request(app)
      .get("/users/bookmarks")
      .set("Cookie", [`jwt=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.data[0].isMine).toBe(true);
  });
});

describe("POST /users/:userid/block", () => {
  let userA: any;
  let userB: any;
  let token: string;

  beforeEach(async () => {
    await clearDb();

    const hashedPassword = await bcrypt.hash("password123", 10);

    userA = await prisma.user.create({
      data: { name: "Alice", password: hashedPassword, imgUrl: "img1" },
    });

    userB = await prisma.user.create({
      data: { name: "Bob", password: hashedPassword, imgUrl: "img2" },
    });

    token = jwt.sign({ id: userA.id }, SECRET, { expiresIn: "1h" });
  });

  it("should block the target user", async () => {
    const res = await request(app)
      .post(`/users/${userB.id}/block`)
      .set("Cookie", [`jwt=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("successfully blocked user");

    const updated = await prisma.user.findUnique({
      where: { id: userA.id },
      include: { blocked: true },
    });

    expect(updated?.blocked.some((u) => u.id === userB.id)).toBe(true);
  });

  it("should handle blocking an already blocked user (Idempotency)", async () => {
    await prisma.user.update({
      where: { id: userA.id },
      data: { blocked: { connect: [{ id: userB.id }] } },
    });

    const res = await request(app)
      .post(`/users/${userB.id}/block`)
      .set("Cookie", [`jwt=${token}`]);

    expect(res.status).toBe(200);
    const updated = await prisma.user.findUnique({
      where: { id: userA.id },
      include: { blocked: true },
    });
    expect(updated?.blocked).toHaveLength(1);
  });

  it("should handle self-blocking attempts", async () => {
    const res = await request(app)
      .post(`/users/${userA.id}/block`)
      .set("Cookie", [`jwt=${token}`]);

    expect(res.status).toBe(200);

    const updated = await prisma.user.findUnique({
      where: { id: userA.id },
      include: { blocked: true },
    });

    expect(updated?.blocked.some((u) => u.id === userA.id)).toBe(true);
  });

  it("should return 401 if no jwt cookie", async () => {
    const res = await request(app).post(`/users/${userB.id}/block`);
    expect(res.status).toBe(401);
  });

  it("should fail with 500 if blocked user does not exist", async () => {
    const res = await request(app)
      .post(`/users/nonexistent-id/block`)
      .set("Cookie", [`jwt=${token}`]);

    expect(res.status).toBe(500);
  });
});
