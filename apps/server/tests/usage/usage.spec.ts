import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { UsageService } from "../../src/usage/usage.service";
import { createId } from "@paralleldrive/cuid2";
import { Logger } from "@nestjs/common";

describe("IntegrationTesting of userService", () => {
  let moduleRef: TestingModule;
  let usageService: UsageService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    usageService = await moduleRef.resolve<UsageService>(UsageService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it("User service should be defined", () => {
    expect(usageService).toBeDefined();
  });

  describe("usageService methods (create/delete)", () => {
    jest.setTimeout(40000);

    it("create usage: created with all fields", async () => {
      const userId = createId();
      const result = await usageService.create(userId);

      expect(result.userId).toEqual(userId);
      expect(result.resumes).toEqual(0);
      expect(result.downloads).toEqual(0);
      expect(result.views).toEqual(0);
      expect(result.alWords).toEqual(0);

      await usageService.deleteByUserId(userId);
    });

    it("deleteByUserId: usage is deleted", async () => {
      const userId = createId();
      const result = await usageService.create(userId);

      expect(result.userId).toEqual(userId);

      await usageService.deleteByUserId(result.userId);

      const foundDeletedUser = await usageService.findOneByUserId(result.userId);

      expect(foundDeletedUser).toBeFalsy();
    });
  });

  describe("usageService methods - update", () => {
    jest.setTimeout(60000);

    it("changeFieldByNumberBy1: views are increased to 1", async () => {
      const userId = createId();
      const result = await usageService.create(userId);

      const updateDto = {
        field: "views",
        action: "increment",
      };

      await usageService.changeFieldByNumberBy1(userId, updateDto);
      await usageService.changeFieldByNumberBy1(userId, updateDto);
      const response = await usageService.changeFieldByNumberBy1(userId, updateDto);

      expect(response.views).toEqual(3);

      await usageService.deleteByUserId(result.userId);
    });

    it("changeFieldByNumberBy1: views are decreased", async () => {
      const userId = createId();
      const result = await usageService.create(userId);

      const incrementDto = {
        field: "views",
        action: "increment",
      };

      const decrementDto = {
        field: "views",
        action: "decrement",
      };

      await usageService.changeFieldByNumberBy1(userId, incrementDto);
      await usageService.changeFieldByNumberBy1(userId, incrementDto);

      const updatedUsage = await usageService.changeFieldByNumberBy1(userId, decrementDto);

      expect(updatedUsage.views).toEqual(1);

      await usageService.deleteByUserId(result.userId);
    });
  });
});
