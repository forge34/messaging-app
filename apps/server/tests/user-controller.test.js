import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { app } from "../src/app";
import { prisma } from "@chat/db";
const SECRET = process.env.SECRET;
let userId;
let token;
describe("GET /users/", async () => {
    let otherUser;
    beforeEach(async () => {
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
            },
        });
    });
    it("should should return all users when jwt is valid", async () => {
        const res = await request(app)
            .get("/users")
            .set("Cookie", [`jwt=${token}`]);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        const other = res.body.find((u) => u.id === otherUser.id);
        const main = res.body.find((u) => u.id === "2");
        expect(main.isCurrent).toBe(true);
        expect(other.isCurrent).toBe(false);
    });
    it("should reject access with no or invalid cookie", async () => {
        const res = await request(app)
            .get("/users/")
            .set("Cookie", [`jwt=invalidtoken`]);
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Unauthorized");
    });
});
describe("GET /users/me ", () => {
    beforeEach(async () => {
        await prisma.user.deleteMany();
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
        expect(res.body).toMatchObject({
            id: userId,
            name: "JwtUser",
        });
    });
    it("should reject access with missing cookie", async () => {
        const res = await request(app).get("/users/me");
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Unauthorized");
    });
    it("should reject access with invalid jwt cookie", async () => {
        const res = await request(app)
            .get("/users/me")
            .set("Cookie", [`jwt=invalidtoken`]);
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Unauthorized");
    });
});
describe("POST /users/:userid/block", () => {
    let userA;
    let userB;
    let token;
    beforeEach(async () => {
        await prisma.user.deleteMany();
        const hashedPassword = await bcrypt.hash("password123", 10);
        userA = await prisma.user.create({
            data: {
                name: "Alice",
                password: hashedPassword,
                imgUrl: "img1",
            },
        });
        userB = await prisma.user.create({
            data: {
                name: "Bob",
                password: hashedPassword,
                imgUrl: "img2",
            },
        });
        token = jwt.sign({ id: userA.id }, SECRET, { expiresIn: "1h" });
    });
    it("should block the target user", async () => {
        const res = await request(app)
            .post(`/users/${userB.id}/block`)
            .set("Cookie", [`jwt=${token}`]);
        expect(res.status).toBe(200);
        expect(res.body).toBe("successfully blocked user");
        const updated = await prisma.user.findUnique({
            where: { id: userA.id },
            include: { blocked: true },
        });
        expect(updated?.blocked.some((u) => u.id === userB.id)).toBe(true);
    });
    it("should return 401 if no jwt cookie", async () => {
        const res = await request(app).post(`/users/${userB.id}/block`);
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Unauthorized");
    });
    it("should fail with 500 if blocked user does not exist", async () => {
        const res = await request(app)
            .post(`/users/nonexistent-id/block`)
            .set("Cookie", [`jwt=${token}`]);
        expect(res.status).toBe(500);
    });
});
