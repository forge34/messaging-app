import { createServer } from "http";
import { app } from "../app";
import { test } from "vitest";
import request from "supertest";

const server = createServer(app);

test("index route works", (done) => {
  request(server)
    .get("/")
    .expect("Content-Type", /json/)
    .expect({ name: "frodo" })
    .expect(200, done);
});
