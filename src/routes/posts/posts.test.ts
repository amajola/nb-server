import { expect, test, describe } from "bun:test";
import {  createUserFunction } from "../../utils/testUtils";
import app from "../..";
import { faker } from "@faker-js/faker";

describe("Posts Testings", async () => {
  const userRequest = await createUserFunction();
  const auth = userRequest.headers.get("Authorization");
  const user = await userRequest.json();

  test("Testing Adding a Post", async () => {
    const content = faker.lorem.paragraph();
    const qoute = faker.lorem.sentence();
    const req = new Request("http://localhost:3000/posts/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth}`,
      },
      body: JSON.stringify({
        content,
        qoute,
        userId: user.id,
        isCountDown: false,
        countDownDate: null,
      }),
    });
    const res = await app.request(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveProperty("id");
    expect(body).toHaveProperty("userId");
    expect(body).toHaveProperty("qoute");
    expect(body).toHaveProperty("isCountDown");
    expect(body).toHaveProperty("countDownDate");
    expect(body).toHaveProperty("content");

    expect(body.userId).toBe(user.id);
    expect(body.qoute).toBe(qoute);
    expect(body.isCountDown).toBe(false);
    expect(body.countDownDate).toBe(null);
    expect(body.content).toBe(content);
  });
  test("Testing Adding a Post with Countdown", async () => {
    const content = faker.lorem.paragraph();
    const qoute = faker.lorem.sentence();
    const countDownDate = new Date();
    const req = new Request("http://localhost:3000/posts/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth}`,
      },
      body: JSON.stringify({
        content,
        qoute,
        userId: user.id,
        isCountDown: true,
        countDownDate: countDownDate.toDateString(),
      }),
    });
    const res = await app.request(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveProperty("id");
    expect(body).toHaveProperty("userId");
    expect(body).toHaveProperty("qoute");
    expect(body).toHaveProperty("isCountDown");
    expect(body).toHaveProperty("countDownDate");
    expect(body).toHaveProperty("content");

    expect(body.userId).toBe(user.id);
    expect(body.qoute).toBe(qoute);
    expect(body.isCountDown).toBe(true);
    expect(body.countDownDate).toBe(new Date(body.countDownDate).toISOString());
    expect(body.content).toBe(content);
  });
  test("Getting Posts", async () => {
    const req = new Request("http://localhost:3000/posts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth}`,
      },
    });
    const res = await app.request(req);
    const body = await res.json();

    expect(body).toHaveProperty("posts");
  });
});
