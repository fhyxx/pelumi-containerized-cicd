
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("./app");

test("GET / returns HTTP 200", async () => {
    const response = await request(app).get("/");

    assert.equal(response.status, 200);
});

test("homepage contains the project heading", async () => {
    const response = await request(app).get("/");

    assert.match(
        response.text,
        /Project 02: Containerized CI\/CD Pipeline/
    );
});

test("homepage identifies the project author", async () => {
    const response = await request(app).get("/");

    assert.match(response.text, /Pelumi Oke/);
});
