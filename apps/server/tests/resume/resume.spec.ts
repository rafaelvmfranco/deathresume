import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { ResumeService } from "../../src/resume/resume.service";
import { FirebaseResumeService } from "../../src/resume/firebase-resume.service";
import { UserService } from "../../src/user/user.service";
import { FirebaseUserService } from "../../src/user/firebase-user.service";
import { getFakeUserCreateBody } from "../constants"
import { CreateResumeDto } from "../../../../libs/dto/src/resume";

function getResumeCreateDto({ visibility }: { visibility: "private" | "public" }): CreateResumeDto {
  return {
    title: "new title",
    slug: "slug/slug",
    visibility,
  };
}

function extractVariableFields(object: Record<string, any>) {
  delete object.id;
  delete object.userId;
  delete object.createdAt;
  delete object.updatedAt;
  delete object.data.basics.email;
  delete object.data.basics.name;
  delete object.data.metadata.layout;
  delete object.locked;

  return object;
}

function compareCreatedResumes(createdResume: any, firebaseCreatedResume: any) {


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
  
  let userService: UserService;
  let firebaseUserService: FirebaseUserService;
  let resumeService: ResumeService;
  let firebaseResumeService: FirebaseResumeService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

   
    userService = await moduleRef.resolve<UserService>(UserService);
    firebaseUserService = await moduleRef.resolve<FirebaseUserService>(FirebaseUserService);
    resumeService = await moduleRef.resolve<ResumeService>(ResumeService);
    firebaseResumeService = await moduleRef.resolve<FirebaseResumeService>(FirebaseResumeService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it("Resume services should be defined", () => {
    expect(resumeService).toBeDefined();
    expect(firebaseResumeService).toBeDefined();
    expect(userService).toBeDefined();
    expect(firebaseUserService).toBeDefined();
  })

  describe("resumeService methods: (create)", () => {
    jest.setTimeout(100000);

    it("Resume is created", async () => {
      const createDto = getResumeCreateDto({ visibility: "public" });

      const user = await userService.create(getFakeUserCreateBody({ provider: "email" }));
      const firebaseUser = await firebaseUserService.create(
        getFakeUserCreateBody({ provider: "email" }),
      );

      expect(user.id).toBeTruthy();
      expect(firebaseUser.id).toBeTruthy();

      const resume = await resumeService.create(user.id, createDto);
      const firebaseResume = await firebaseResumeService.create(firebaseUser.id, createDto);

      expect(resume.id).toBeTruthy();
      expect(firebaseResume.id).toBeTruthy();

      compareCreatedResumes(resume, firebaseResume);

      await resumeService.remove(user.id, resume.id);
      await firebaseResumeService.remove(firebaseUser.id, firebaseResume.id);

      await userService.deleteOneById(user.id);
      await firebaseUserService.deleteOneById(firebaseUser.id);
    });
  });

  describe("resumeService methods: delete", () => {
    jest.setTimeout(40000);

    it("delete: for created user 1 resume created, deleted and not found, results are compared", async () => {
      const createDto = getResumeCreateDto({ visibility: "public" });

      const user = await userService.create(getFakeUserCreateBody({ provider: "email" }));
      const firebaseUser = await firebaseUserService.create(
        getFakeUserCreateBody({ provider: "email" }),
      );

      expect(user.id).toBeTruthy();
      expect(firebaseUser.id).toBeTruthy();

      const createdResume = await resumeService.create(user.id, createDto);
      const firebaseCreatedResume = await firebaseResumeService.create(firebaseUser.id, createDto);

      expect(createdResume.id).toBeTruthy();
      expect(firebaseCreatedResume.id).toBeTruthy();

      await resumeService.remove(user.id, createdResume.id);
      await firebaseResumeService.remove(firebaseCreatedResume.id, firebaseCreatedResume.id);

      const foundResume = await resumeService.findOne(createdResume.id, user.id);
      const firebaseFoundResume = await firebaseResumeService.findOne(
        firebaseCreatedResume.id,
        firebaseUser.id,
      );

      expect(foundResume).toThrow();
      expect(firebaseFoundResume).toThrow();

      await userService.deleteOneById(user.id);
      await firebaseUserService.deleteOneById(firebaseUser.id);
    });
  });

  describe("resumeService methods (find all/find one/findOneByUsernameSlug)", () => {
    jest.setTimeout(40000);

    it("findAll: for created user 1 resume created and found, results are compared", async () => {
      const createDto = getResumeCreateDto({ visibility: "public" });

      const user = await userService.create(getFakeUserCreateBody({ provider: "email" }));
      const firebaseUser = await firebaseUserService.create(
        getFakeUserCreateBody({ provider: "email" }),
      );

      expect(user.id).toBeTruthy();
      expect(firebaseUser.id).toBeTruthy();

      const createdResume = await resumeService.create(user.id, createDto);
      const firebaseCreatedResume = await firebaseResumeService.create(firebaseUser.id, createDto);

      expect(createdResume.id).toBeTruthy();
      expect(firebaseCreatedResume.id).toBeTruthy();

      const foundResumes = await resumeService.findAll(user.id);
      const firebaseFoundResumes = await firebaseResumeService.findAll(firebaseUser.id);

      expect(foundResumes.length).toEqual(1);
      expect(firebaseFoundResumes.length).toEqual(1);

      compareResumesList(foundResumes, firebaseFoundResumes);

      await resumeService.remove(user.id, createdResume.id);
      await firebaseResumeService.remove(firebaseUser.id, firebaseCreatedResume.id);

      await userService.deleteOneById(user.id);
      await firebaseUserService.deleteOneById(firebaseUser.id);
    });
  });

  it("findOne: for created user 1 resume created and found, results are compared", async () => {
    jest.setTimeout(40000);

    const createDto = getResumeCreateDto({ visibility: "public" });

    const user = await userService.create(getFakeUserCreateBody({ provider: "email" }));
    const firebaseUser = await firebaseUserService.create(
      getFakeUserCreateBody({ provider: "email" }),
    );

    expect(user.id).toBeTruthy();
    expect(firebaseUser.id).toBeTruthy();

    const createdResume = await resumeService.create(user.id, createDto);
    const firebaseCreatedResume = await firebaseResumeService.create(firebaseUser.id, createDto);

    expect(createdResume.id).toBeTruthy();
    expect(firebaseCreatedResume.id).toBeTruthy();

    const foundResume = await resumeService.findOne(createdResume.id, user.id);
    const firebaseFoundResume = await firebaseResumeService.findOne(
      firebaseCreatedResume.id,
      firebaseUser.id,
    );

    compareCreatedResumes(foundResume, firebaseFoundResume);

    await resumeService.remove(user.id, createdResume.id);
    await firebaseResumeService.remove(firebaseCreatedResume.id, firebaseCreatedResume.id);

    await userService.deleteOneById(user.id);
    await firebaseUserService.deleteOneById(firebaseUser.id);
  });

  it("findOneByUsernameSlug: for created user 1 resume created and found, results are compared", async () => {
    jest.setTimeout(40000);

    const createDto = getResumeCreateDto({ visibility: "public" });

    const user = await userService.create(getFakeUserCreateBody({ provider: "email" }));
    const firebaseUser = await firebaseUserService.create(
      getFakeUserCreateBody({ provider: "email" }),
    );

    expect(user.id).toBeTruthy();
    expect(firebaseUser.id).toBeTruthy();

    const createdResume = await resumeService.create(user.id, createDto);
    const firebaseCreatedResume = await firebaseResumeService.create(firebaseUser.id, createDto);

    expect(createdResume.id).toBeTruthy();
    expect(firebaseCreatedResume.id).toBeTruthy();

    const foundResume = await resumeService.findOneByUsernameSlug(
      user.name,
      createdResume.slug,
      user.id,
    );

    const firebaseFoundResume = await firebaseResumeService.findOneByUsernameSlug(
      (firebaseUser as any).name,
      (firebaseCreatedResume as any).slug,
      firebaseUser.id,
    );

    compareCreatedResumes(foundResume, firebaseFoundResume);

    await resumeService.remove(user.id, createdResume.id);
    await firebaseResumeService.remove(firebaseCreatedResume.id, firebaseCreatedResume.id);

    await userService.deleteOneById(user.id);
    await firebaseUserService.deleteOneById(firebaseUser.id);
  });

  describe("resumeService methods (update/lock)", () => {
    it("update: for created user 1 resume created and updated, results are compared", async () => {
      const createDto = getResumeCreateDto({ visibility: "public" });

      const user = await userService.create(getFakeUserCreateBody({ provider: "email" }));
      const firebaseUser = await firebaseUserService.create(
        getFakeUserCreateBody({ provider: "email" }),
      );

      expect(user.id).toBeTruthy();
      expect(firebaseUser.id).toBeTruthy();

      const createdResume = await resumeService.create(user.id, createDto);
      const firebaseCreatedResume = await firebaseResumeService.create(firebaseUser.id, createDto);

      expect(createdResume.id).toBeTruthy();
      expect(firebaseCreatedResume.id).toBeTruthy();

      const updateDto: any = {
        ...createdResume,
      };
      updateDto.data.basics.headline = "New Headline";

      const firebaseUpdateDto: any = {
        ...firebaseCreatedResume,
      };
      firebaseUpdateDto.data.basics.headline = "New Headline";

      const foundResumes = await resumeService.update(user.id, createdResume.id, updateDto);
      const firebaseFoundResumes = await firebaseResumeService.update(
        firebaseUser.id,
        firebaseCreatedResume.id,
        updateDto,
      );

      expect((foundResumes as any).headline).toEqual(updateDto.data.basics.headline);
      expect((firebaseFoundResumes as any).headline).toEqual(firebaseUpdateDto.data.basics.headline);

      await resumeService.remove(user.id, createdResume.id);
      await firebaseResumeService.remove(firebaseCreatedResume.id, firebaseCreatedResume.id);

      await userService.deleteOneById(user.id);
      await firebaseUserService.deleteOneById(firebaseUser.id);
    });
  });

  it("lock: for created user 1 resume created and lock field is set as false, results are compared", async () => {
    const createDto = getResumeCreateDto({ visibility: "public" });

    const user = await userService.create(getFakeUserCreateBody({ provider: "email" }));
    const firebaseUser = await firebaseUserService.create(
      getFakeUserCreateBody({ provider: "email" }),
    );

    expect(user.id).toBeTruthy();
    expect(firebaseUser.id).toBeTruthy();

    const createdResume = await resumeService.create(user.id, createDto);
    const firebaseCreatedResume = await firebaseResumeService.create(firebaseUser.id, createDto);

    expect(createdResume.id).toBeTruthy();
    expect(firebaseCreatedResume.id).toBeTruthy();

    const foundResume = await resumeService.lock(user.id, createdResume.id, false);
    const firebaseFoundResume = await firebaseResumeService.lock(
      firebaseUser.id,
      firebaseCreatedResume.id,
      false,
    );

    expect((foundResume as any).locked).toEqual(false);
    expect((firebaseFoundResume as any).locked).toEqual(false);

    await resumeService.remove(user.id, createdResume.id);
    await firebaseResumeService.remove(firebaseCreatedResume.id, firebaseCreatedResume.id);

    await userService.deleteOneById(user.id);
    await firebaseUserService.deleteOneById(firebaseUser.id);
  });
});
