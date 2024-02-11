import { Test, TestingModule } from "@nestjs/testing";
import { faker } from "@faker-js/faker";
import { AppModule } from "../../src/app.module";
import { UserService } from "../../src/user/user.service";

function getFakeUserCreateBody({ provider }: Record<"provider", "email" | "google">) {
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

describe("IntegrationTesting of userService", () => {
  let moduleRef: TestingModule;
  let userService: UserService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userService = await moduleRef.resolve<UserService>(UserService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it("User service should be defined", () => {
    expect(userService).toBeDefined();
  });

  describe("userService methods (create/delete)", () => {
    it("create (with email): User is created with secrets", async () => {
      const userDto = getFakeUserCreateBody({ provider: "email" });
      const result = await userService.create(userDto as any);

      expect(result).toBeTruthy();
      expect(result?.id).toBeTruthy();
      expect(result?.secrets?.id).toBeTruthy();
      expect(result.id).toEqual(result?.secrets?.userId);

      expect(result.name).toEqual(userDto.name);
      expect(result.email).toEqual(userDto.email);
      expect(result.username).toEqual(userDto.username);
      expect(result.locale).toEqual(userDto.locale);
      expect(result.provider).toEqual(userDto.provider);
      expect(result?.secrets?.password).toEqual(userDto?.secrets?.create.password);

      await userService.deleteOneById(result.id);
    });

    it("create (with google): User is created with secrets", async () => {
      const userDto = getFakeUserCreateBody({ provider: "google" });
      const result = await userService.create(userDto as any);

      expect(result).toBeTruthy();
      expect(result?.id).toBeTruthy();
      expect(result?.secrets?.id).toBeTruthy();
      expect(result.id).toEqual(result?.secrets?.userId);

      expect(result.name).toEqual(userDto.name);
      expect(result.email).toEqual(userDto.email);
      expect(result.username).toEqual(userDto.username);
      expect(result.locale).toEqual(userDto.locale);
      expect(result.provider).toEqual(userDto.provider);
      expect(result?.secrets?.password).toEqual(userDto?.secrets?.create.password);

      await userService.deleteOneById(result.id);
    });

    it("deleteOneById: User is deleted", async () => {
      const userDto = getFakeUserCreateBody({ provider: "email" });
      const result = await userService.create(userDto as any);

      const response = await userService.deleteOneById(result.id);
      expect(response).toBeTruthy();
      expect(response.id).toEqual(result.id);
    });
  });

  describe("userService methods (read/edit)", () => {
    it("findOneById: User with secrets is found by its id", async () => {
      const userDto = getFakeUserCreateBody({ provider: "google" });
      const user = await userService.create(userDto as any);
      const id = user.id;

      const result = await userService.findOneById(id);

      expect(result).toEqual(user);
      expect(result?.secrets).toBeTruthy();

      await userService.deleteOneById(id);
    });
  });

  it("updateByEmail: User is updated", async () => {
    const userDto = getFakeUserCreateBody({ provider: "google" });
    const user = await userService.create(userDto as any);
    const email = user.email;

    const data = {
      secrets: {
        update: {
          refreshToken: null,
        },
      },
    };

    const result = await userService.updateByEmail(email, data);

    expect(result.name).toEqual(user.name);
    expect(result.email).toEqual(user.email);
    expect(result.username).toEqual(user.username);
    expect(result.locale).toEqual(user.locale);
    expect(result.provider).toEqual(user.provider);
    expect((result as any)?.secrets).toBeFalsy();

    await userService.deleteOneById(user.id);
  });
});
