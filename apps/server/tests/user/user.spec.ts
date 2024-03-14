import { Test, TestingModule } from "@nestjs/testing";
import { faker } from "@faker-js/faker";
import { AppModule } from "../../src/app.module";
import { UserService } from "../../src/user/user.service";
import { FirebaseUserService } from "../../src/user/firebase-user.service";

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

function validateUpdate(dto: any, userResult: any, firebaseUserResult?: any){
  expect(userResult.name).toEqual(dto.name);
  expect(userResult.email).toEqual(dto.email);
  expect(userResult.username).toEqual(dto.username);
  expect(userResult.locale).toEqual(dto.locale);
  expect(userResult.provider).toEqual(dto.provider);

  expect(firebaseUserResult.name).toEqual(dto.name);
  expect(firebaseUserResult.email).toEqual(dto.email);
  expect(firebaseUserResult.username).toEqual(dto.username);
  expect(firebaseUserResult.locale).toEqual(dto.locale);
  expect(firebaseUserResult.provider).toEqual(dto.provider);
}

function validateCreateResults(dto: any, userResult: any, firebaseUserResult?: any) {
  expect(userResult).toBeTruthy();
  expect(userResult?.id).toBeTruthy();
  expect(userResult?.secrets?.id).toBeTruthy();
  expect(userResult.id).toEqual(userResult?.secrets?.userId);

  expect(firebaseUserResult).toBeTruthy();
  expect(firebaseUserResult?.id).toBeTruthy();
  expect(firebaseUserResult?.secrets?.id).toBeTruthy();
  expect(firebaseUserResult.id).toEqual(userResult?.secrets?.userId);

  validateUpdate(dto, userResult, firebaseUserResult);

  expect(userResult?.secrets?.password).toEqual(dto?.secrets?.create.password);
  expect(firebaseUserResult?.secrets?.password).toEqual(dto?.secrets?.create.password);
}

describe("IntegrationTesting of userService", () => {
  let moduleRef: TestingModule;
  let userService: UserService;
  let firebaseUserService: FirebaseUserService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userService = await moduleRef.resolve<UserService>(UserService);
    firebaseUserService = await moduleRef.resolve<FirebaseUserService>(FirebaseUserService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it("User service should be defined", () => {
    expect(userService).toBeDefined();
    expect(firebaseUserService).toBeDefined();
  });

  describe("userService methods (create/delete)", () => {
    it("create (with email): User is created with secrets", async () => {
      const userDto = getFakeUserCreateBody({ provider: "email" });
      const result = await userService.create(userDto as any);
      const firebaseResult = await firebaseUserService.create(userDto as any);
      
      validateCreateResults(userDto, result, firebaseResult)

      await userService.deleteOneById(result.id);
      await firebaseUserService.deleteOneById(firebaseResult.id);
    });

    it("create (with google): User is created with secrets", async () => {
      const userDto = getFakeUserCreateBody({ provider: "google" });
      const result = await userService.create(userDto as any);
      const firebaseResult = await firebaseUserService.create(userDto as any);

      validateCreateResults(userDto, result, firebaseResult)

      await userService.deleteOneById(result.id);
      await firebaseUserService.deleteOneById(firebaseResult.id);
    });

    it("deleteOneById: User is deleted", async () => {
      const userDto = getFakeUserCreateBody({ provider: "email" });

      const result = await userService.create(userDto as any);
      const firebaseResult = await firebaseUserService.create(userDto as any);

      const response = await userService.deleteOneById(result.id);
      const firebaseResponse = await firebaseUserService.deleteOneById(firebaseResult.id);

      expect(response).toBeTruthy();
      expect(response.id).toEqual(result.id);

      expect(firebaseResponse).toBeTruthy();
      expect(firebaseResponse.id).toEqual(result.id);
    });
  });

  describe("userService methods (read/edit)", () => {
    it("findOneById: User with secrets is found by its id", async () => {
      const userDto = getFakeUserCreateBody({ provider: "google" });

      const user = await userService.create(userDto as any);
      const firebaseUser = await firebaseUserService.create(userDto as any);

      const id = user.id;
      const firebaseId = firebaseUser.id;

      const result = await userService.findOneById(id);
      const firebaseResult = await firebaseUserService.findOneById(firebaseId);

      expect(result).toEqual(user);
      expect(result?.secrets).toBeTruthy();

      expect(firebaseResult).toEqual(user);
      expect(firebaseResult?.secrets).toBeTruthy();

      await userService.deleteOneById(id);
      await firebaseUserService.deleteOneById(user.id);
    });
  });

  it("updateByEmail: User is updated", async () => {
    const userDto = getFakeUserCreateBody({ provider: "google" });

    const user = await userService.create(userDto as any);
    const firebaseUser = await firebaseUserService.create(userDto as any);
    
    const email = user.email;
    const firebaseEmail = firebaseUser.email;

    const updateData = {
      secrets: {
        update: {
          refreshToken: null,
        },
      },
    };

    const result = await userService.updateByEmail(email, updateData);
    const firebaseResult = await firebaseUserService.updateByEmail(firebaseEmail, updateData);

    validateUpdate(user, result, firebaseUser);

    expect((result as any)?.secrets).toBeFalsy();
    expect((firebaseResult as any)?.secrets).toBeFalsy();

    await userService.deleteOneById(user.id);
    await firebaseUserService.deleteOneById(user.id);
  });
});
