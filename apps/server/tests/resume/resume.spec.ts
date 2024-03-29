import { Test, TestingModule } from "@nestjs/testing";
import { faker } from "@faker-js/faker";
import { AppModule } from "../../src/app.module";
import { ResumeService } from "../../src/resume/resume.service";
import { FirebaseResumeService } from "../../src/resume/firebase-resume.service";
import { UserService } from "../../src/user/user.service";
import { FirebaseUserService } from "../../src/user/firebase-user.service";
import { getFakeUserCreateBody } from "../user/user.spec";

function getResumeCreateDto(visibility: Record<"visibility", "private" | "public">) {
  return {
    title: faker.string.sample(),
    slug: faker.string.sample(),
    visibility,
  };
}

function extractVariableFields(object: Record<string, any>) {
  delete object.id;
  delete object.createdAt;
  delete object.updatedAt;

  return object;
}

function compareCreatedResumes(createdResume: any, firebaseCreatedResume: any) {
  delete createdResume.id;
  delete createdResume.createdAt;
  delete createdResume.updatedAt;

  delete firebaseCreatedResume.id;
  delete firebaseCreatedResume.createdAt;
  delete firebaseCreatedResume.updatedAt;

  expect(extractVariableFields(createdResume)).toEqual(
    extractVariableFields(firebaseCreatedResume),
  );
}

function compareResumesList(createdResumes: any[], firebaseCreatedResumes: any[]) {
  const foundResumes = createdResumes.map((resume) => extractVariableFields(resume));
  const firebaseFoundResumes = firebaseCreatedResumes.map((resume) =>
    extractVariableFields(resume),
  );
  expect(foundResumes).toEqual(expect.arrayContaining(firebaseFoundResumes));
}

describe("IntegrationTesting of resumeService", () => {
  let moduleRef: TestingModule;
  let resumeService: ResumeService;
  let firebaseResumeService: FirebaseResumeService;
  let userService: UserService;
  let firebaseUserService: FirebaseUserService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    resumeService = await moduleRef.resolve<ResumeService>(ResumeService);
    firebaseResumeService = await moduleRef.resolve<FirebaseResumeService>(FirebaseResumeService);
    userService = await moduleRef.resolve<UserService>(UserService);
    firebaseUserService = await moduleRef.resolve<FirebaseUserService>(FirebaseUserService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it("Resume services should be defined", () => {
    expect(resumeService).toBeDefined();
    expect(firebaseResumeService).toBeDefined();
  });

  describe("resumeService methods: (create)", () => {
    jest.setTimeout(40000);

    it("Resume is created", async () => {
      const createDto = getResumeCreateDto({ visibility: "public" });

      const createdUser = await userService.create(getFakeUserCreateBody({ provider: "email" }));
      const firebaseCreatedUser = await firebaseUserService.create(
        getFakeUserCreateBody({ provider: "email" }),
      );

      const createdResume = await resumeService.create(createdUser.id, createDto);
      const firebaseCreatedResume = await firebaseResumeService.create(createdUser.id, createDto);

      compareCreatedResumes(createdResume, firebaseCreatedResume);

      await resumeService.remove(createdUser.id, createdResume.id);
      await firebaseResumeService.remove(firebaseCreatedResume.id, firebaseCreatedResume.id);

      await userService.deleteOneById(createdUser.id);
      await firebaseUserService.deleteOneById(firebaseCreatedUser.id);
    });
  });

  describe("resumeService methods: delete", () => {
    it("delete: for created user 1 resume created, deleted and not found, results are compared", async () => {
      const createDto = getResumeCreateDto({ visibility: "public" });

      const createdUser = await userService.create(getFakeUserCreateBody({ provider: "email" }));
      const firebaseCreatedUser = await firebaseUserService.create(
        getFakeUserCreateBody({ provider: "email" }),
      );

      const createdResume = await resumeService.create(createdUser.id, createDto);
      const firebaseCreatedResume = await firebaseResumeService.create(createdUser.id, createDto);

      await resumeService.remove(createdUser.id, createdResume.id);
      await firebaseResumeService.remove(firebaseCreatedResume.id, firebaseCreatedResume.id);

      const foundResume = await resumeService.findOne(createdResume.id, createdUser.id);
      const firebaseFoundResume = await firebaseResumeService.findOne(
        firebaseCreatedResume.id,
        firebaseCreatedUser.id,
      );

      expect(foundResume).toThrow();
      expect(firebaseFoundResume).toThrow();

      await userService.deleteOneById(createdUser.id);
      await firebaseUserService.deleteOneById(firebaseCreatedUser.id);
    });
  });

  describe("resumeService methods (find all/find one/findOneByUsernameSlug)", () => {
    it("findAll: for created user 1 resume created and found, results are compared", async () => {
      const createDto = getResumeCreateDto({ visibility: "public" });

      const createdUser = await userService.create(getFakeUserCreateBody({ provider: "email" }));
      const firebaseCreatedUser = await firebaseUserService.create(
        getFakeUserCreateBody({ provider: "email" }),
      );

      const createdResume = await resumeService.create(createdUser.id, createDto);
      const firebaseCreatedResume = await firebaseResumeService.create(createdUser.id, createDto);

      const foundResumes = await resumeService.findAll(createdUser.id);
      const firebaseFoundResumes = await firebaseResumeService.findAll(createdUser.id);

      compareResumesList(foundResumes, firebaseFoundResumes);

      await resumeService.remove(createdUser.id, createdResume.id);
      await firebaseResumeService.remove(firebaseCreatedResume.id, firebaseCreatedResume.id);

      await userService.deleteOneById(createdUser.id);
      await firebaseUserService.deleteOneById(firebaseCreatedUser.id);
    });
  });

  it("findOne: for created user 1 resume created and found, results are compared", async () => {
    const createDto = getResumeCreateDto({ visibility: "public" });

    const createdUser = await userService.create(getFakeUserCreateBody({ provider: "email" }));
    const firebaseCreatedUser = await firebaseUserService.create(
      getFakeUserCreateBody({ provider: "email" }),
    );

    const createdResume = await resumeService.create(createdUser.id, createDto);
    const firebaseCreatedResume = await firebaseResumeService.create(createdUser.id, createDto);

    const foundResume = await resumeService.findOne(createdResume.id, createdUser.id);
    const firebaseFoundResume = await firebaseResumeService.findOne(
      firebaseCreatedUser.id,
      firebaseCreatedResume.id,
    );

    expect(extractVariableFields(foundResume)).toEqual(firebaseFoundResume);

    await resumeService.remove(createdUser.id, createdResume.id);
    await firebaseResumeService.remove(firebaseCreatedResume.id, firebaseCreatedResume.id);

    await userService.deleteOneById(createdUser.id);
    await firebaseUserService.deleteOneById(firebaseCreatedUser.id);
  });

  it("findOneByUsernameSlug: for created user 1 resume created and found, results are compared", async () => {
    const createDto = getResumeCreateDto({ visibility: "public" });

    const createdUser = await userService.create(getFakeUserCreateBody({ provider: "email" }));
    const firebaseCreatedUser = await firebaseUserService.create(
      getFakeUserCreateBody({ provider: "email" }),
    );

    const createdResume = await resumeService.create(createdUser.id, createDto);
    const firebaseCreatedResume = await firebaseResumeService.create(
      firebaseCreatedUser.id,
      createDto,
    );

    const foundResume = await resumeService.findOneByUsernameSlug(
      createdUser.name,
      createdResume.slug,
      createdUser.id,
    );
    const firebaseFoundResume = await firebaseResumeService.findOneByUsernameSlug(
      (firebaseCreatedUser as any).name,
      (firebaseCreatedResume as any).slug,
      firebaseCreatedUser.id,
    );

    expect(extractVariableFields(foundResume)).toEqual(firebaseFoundResume);

    await resumeService.remove(createdUser.id, createdResume.id);
    await firebaseResumeService.remove(firebaseCreatedResume.id, firebaseCreatedResume.id);

    await userService.deleteOneById(createdUser.id);
    await firebaseUserService.deleteOneById(firebaseCreatedUser.id);
  });

  describe("resumeService methods (update/lock)", () => {
    it("update: for created user 1 resume created and updated, results are compared", async () => {
      const createDto = getResumeCreateDto({ visibility: "public" });

      const createdUser = await userService.create(getFakeUserCreateBody({ provider: "email" }));
      const firebaseCreatedUser = await firebaseUserService.create(
        getFakeUserCreateBody({ provider: "email" }),
      );

      const createdResume = await resumeService.create(createdUser.id, createDto);
      const firebaseCreatedResume = await firebaseResumeService.create(createdUser.id, createDto);

      const updateDto = {
        headline: "New Headline",
      };

      const foundResumes = await resumeService.update(createdUser.id, createdResume.id, updateDto);
      const firebaseFoundResumes = await firebaseResumeService.update(firebaseCreatedUser.id, firebaseCreatedResume.id, updateDto);

      expect((foundResumes as any).headline).toEqual(updateDto.headline);
      expect((firebaseFoundResumes as any).headline).toEqual(updateDto.headline);

      await resumeService.remove(createdUser.id, createdResume.id);
      await firebaseResumeService.remove(firebaseCreatedResume.id, firebaseCreatedResume.id);

      await userService.deleteOneById(createdUser.id);
      await firebaseUserService.deleteOneById(firebaseCreatedUser.id);
    });
  });

  it("lock: for created user 1 resume created and lock field is set as false, results are compared", async () => {
    const createDto = getResumeCreateDto({ visibility: "public" });

    const createdUser = await userService.create(getFakeUserCreateBody({ provider: "email" }));
    const firebaseCreatedUser = await firebaseUserService.create(
      getFakeUserCreateBody({ provider: "email" }),
    );

    const createdResume = await resumeService.create(createdUser.id, createDto);
    const firebaseCreatedResume = await firebaseResumeService.create(createdUser.id, createDto);

    const foundResume = await resumeService.lock(createdUser.id, createdResume.id, false);
    const firebaseFoundResume = await firebaseResumeService.lock(
      firebaseCreatedUser.id,
      firebaseCreatedResume.id,
      false,
    );

    expect((foundResume as any).lock).toEqual(false);
    expect((firebaseFoundResume as any).lock).toEqual(false);

    await resumeService.remove(createdUser.id, createdResume.id);
    await firebaseResumeService.remove(firebaseCreatedResume.id, firebaseCreatedResume.id);

    await userService.deleteOneById(createdUser.id);
    await firebaseUserService.deleteOneById(firebaseCreatedUser.id);
  });
});
