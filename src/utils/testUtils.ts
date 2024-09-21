import { faker } from "@faker-js/faker";
import app from "..";

export const createUserFunction = async () => {
  const email = faker.internet.email();
  const password = faker.internet.password();
  const name = faker.person.firstName();
  const createUserRequest = new Request("http://localhost:3000/auth/signup", {
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
  const user = await app.request(createUserRequest);
  return user;
};
