import { Test } from "@nestjs/testing";
import { UserService } from "./user.service";
import { FirebaseUserService } from "./firebase-user.service";
import { PrismaService } from "nestjs-prisma";
import { InternalServerErrorException } from "@nestjs/common";
import { mock, instance, when, verify, anything } from "ts-mockito";
import { UserDto, UserWithSecrets } from "@reactive-resume/dto";
import { Prisma } from "@prisma/client";

describe("UserService", () => {
  let userService: UserService;
  let mockPrismaService: PrismaService;
  let firebaseUserService: FirebaseUserService;

  beforeEach(async () => {
    mockPrismaService = mock(PrismaService);

    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        FirebaseUserService,
        { provide: PrismaService, useValue: instance(mockPrismaService) },
      ],
    }).compile();

    const moduleRefFirebase = await Test.createTestingModule({
      providers: [FirebaseUserService],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
    firebaseUserService = moduleRefFirebase.get<FirebaseUserService>(FirebaseUserService);
  });

  it("should find user by id", async () => {
    const mockUser: UserWithSecrets = {
      id: "1111",
      name: "test user",
      email: "test@test.com",
      picture: "picture link",
      username: "user name",
      locale: "en-US",
      emailVerified: true,
      twoFactorEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: "email",
      secrets: {}
    };

    when(mockPrismaService.user.findUniqueOrThrow(anything())).thenResolve(mockUser as any);

    const user = await userService.findOneById("1111");

    expect(user).toEqual(mockUser);
    verify(mockPrismaService.user.findUniqueOrThrow(anything())).once();
  });

  it("should find user by id", async () => {
    const mockUser = { id: "1", email: "test@test.com", secrets: {} };
    when(mockPrismaService.user.findUnique(anything())).thenResolve(mockUser as any);
    when(mockPrismaService.user.findUniqueOrThrow(anything())).thenResolve(mockUser as any);

    const user = await userService.findOneByIdentifier("1");

    expect(user).toEqual(mockUser);
    verify(mockPrismaService.user.findUnique(anything()) || mockPrismaService.user.findUniqueOrThrow(anything())).once()
  });

  it("should create a user", async () => {
    const mockUser = { id: "1", email: "test@test.com", secrets: {} };
    when(mockPrismaService.user.create(anything())).thenResolve(mockUser as any);

    const dto: Prisma.UserCreateInput = { email: "test@test.com", provider: "email", name: "test user", username: "test username" }
    const user = await userService.create(dto);

    expect(user).toEqual(mockUser);
    verify(mockPrismaService.user.create(anything())).once();
  });

  it("should update a user", async () => {
    const mockUser = { id: "1", email: "test@test.com", secrets: {} };
    when(mockPrismaService.user.update(anything())).thenResolve(mockUser as any);

    //const user = await userService.update("1", { email: "updated@test.com" });

    //expect(user).toEqual(mockUser);
    verify(mockPrismaService.user.update(anything())).once();
  });

  it("should delete a user", async () => {
    when(mockPrismaService.user.delete(anything())).thenResolve();

    await userService.deleteOneById("1");

    verify(mockPrismaService.user.delete(anything())).once();
  });
});
