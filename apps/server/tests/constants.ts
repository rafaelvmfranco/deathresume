import { faker } from "@faker-js/faker";

export function getFakeUserCreateBody({ provider }: Record<"provider", "email" | "google">) {
    return {
      name: faker.internet.userName() + faker.internet.userName(),
      email: `${faker.internet.userName()}@mail.com`,
      username: faker.internet.userName(),
      locale: "en-US",
      provider,
      emailVerified: false,
      secrets: {
        create: {
          password: "$2a$10$nbV.gEhTNGPUyQX.9tQI4eBFQDgr0Mx/MlkNcTgqpTrjjsdNXEHOC",
        },
      },
    };
  }