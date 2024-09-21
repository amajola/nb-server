import { expect, test, describe } from "bun:test";
import app from "../..";
import { faker } from "@faker-js/faker";

describe("Auth Testings", () => {
  const name = faker.person.firstName();
  const email = faker.internet.email();
  const password = faker.internet.password();
  test("Testing Signup", async () => {
    const req = new Request("http://localhost:3000/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        name,
      }),
    });
    const res = await app.request(req);

    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('name');
    expect(body.name).toBe(name);
    expect(body.email).toBe(email);
  });
  test("Testing Signin", async () => {
    const req = new Request("http://localhost:3000/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const res = await app.request(req);

    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('name');
    expect(body.name).toBe(name);
    expect(body.email).toBe(email);
  });
});
