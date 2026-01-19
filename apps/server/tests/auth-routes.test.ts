import { app } from "../src/app.js";
import { prisma } from "@chat/db";
import request from "supertest";
import bcrypt from "bcryptjs";
import { describe, it, expect } from "vitest";

describe("POST /login", () => {
  it("should login a valid user and return JWT cookie", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);

    const username = `Forge-${Date.now()}`;
    await prisma.user.create({
      data: {
        name: username,
        password: hashedPassword,
        imgUrl: "dummy",
      },
    });

    const res = await request(app).post("/login").send({
      username: username,
      password: "password123",
    });

    const cookie = res.headers["set-cookie"];
    expect(cookie).toBeDefined();
    expect(cookie[0].startsWith("jwt")).toBe(true);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login sucess");
  });

  it("should reject login with wrong password", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    await prisma.user.create({
      data: {
        name: "Forge",
        password: hashedPassword,
        imgUrl: "dummy",
      },
    });

    const res = await request(app).post("/login").send({
      username: "Forge",
      password: "wrongpass",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("should reject login for non-existing user", async () => {
    const res = await request(app).post("/login").send({
      username: "GhostUser",
      password: "irrelevantpass",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("should reject login with missing username", async () => {
    const res = await request(app).post("/login").send({
      password: "password123",
    });

    expect(res.status).toBe(401);
  });

  it("should reject login with short password", async () => {
    const res = await request(app).post("/login").send({
      username: "Someone",
      password: "123",
    });

    expect(res.status).toBe(401);
  });
});

describe("POST /signup", () => {
  it("should create a new user with valid input", async () => {
    const res = await request(app).post("/signup").send({
      username: "testuser",
      password: "strongpassword",
      confirmPassword: "strongpassword",
    });

    expect(res.status).toBe(200);

    const user = await prisma.user.findUnique({
      where: { name: "testuser" },
    });

    expect(user).not.toBeNull();
  });

  it("should reject duplicate usernames", async () => {
    await prisma.user.create({
      data: {
        name: "existinguser",
        password: "hashedpassword",
        imgUrl: "dummy",
      },
    });

    const res = await request(app).post("/signup").send({
      username: "existinguser",
      password: "newpassword",
      confirmPassword: "newpassword",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Username already exists");
  });

  it("should reject short passwords", async () => {
    const res = await request(app).post("/signup").send({
      username: "user2",
      password: "short",
      confirmPassword: "short",
    });

    expect(res.status).toBe(401);
    expect(res.body.fields.password).toContain(
      "Password should be at least 8 characters",
    );
  });

  it("should reject when passwords don't match", async () => {
    const res = await request(app).post("/signup").send({
      username: "user3",
      password: "password123",
      confirmPassword: "wrong123",
    });

    expect(res.status).toBe(401);
    expect(res.body.messages).toContain("Passwords do not match");
  });
});
