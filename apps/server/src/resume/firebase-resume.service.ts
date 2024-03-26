import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { CreateResumeDto, ImportResumeDto, ResumeDto, UpdateResumeDto } from "@reactive-resume/dto";
import { defaultResumeData, ResumeData } from "@reactive-resume/schema";
import type { DeepPartial } from "@reactive-resume/utils";
import { generateRandomName, kebabCase } from "@reactive-resume/utils";
import { ErrorMessage } from "@reactive-resume/utils";
import { RedisService } from "@songkeys/nestjs-redis";
import deepmerge from "deepmerge";
import Redis from "ioredis";

import { PrinterService } from "@/server/printer/printer.service";

import { FirebaseService } from "../firebase/firebase.service";
import { UtilsService } from "../utils/utils.service";
import { UsageService } from "../usage/usage.service";

@Injectable()
export class FirebaseResumeService {
  private readonly redis: Redis;

  constructor(
    private readonly printerService: PrinterService,
    private readonly firebaseService: FirebaseService,
    private readonly redisService: RedisService,
    private readonly utils: UtilsService,
    private readonly usageService: UsageService,
  ) {
    this.redis = this.redisService.getClient();
  }

  async create(userId: string, createResumeDto: CreateResumeDto) {

    const { name, email, picture } = await this.firebaseService.findUniqueOrThrow(
      "userCollection",
      { condition: { field: "id", value: userId } },
      { select: ["name", "email", "picture"] },
    );

    const data = deepmerge(defaultResumeData, {
      basics: { name, email, picture: { url: picture ?? "" } },
    } satisfies DeepPartial<ResumeData>);

    const resume = await this.firebaseService.create("resumeCollection", {
      dto: {
        data,
        userId,
        title: createResumeDto.title,
        visibility: createResumeDto.visibility,
        slug: createResumeDto.slug ?? kebabCase(createResumeDto.title),
      },
    });

    await Promise.all([
      this.redis.del(`user:${userId}:resumes`),
      this.redis.set(`user:${userId}:resume:${resume.id}`, JSON.stringify(resume)),
      this.usageService.changeFieldByNumberBy1(userId, {
        action: "increment",
        field: "views",
      }),
      this.usageService.changeFieldByNumberBy1(userId, {
        action: "increment",
        field: "resumes",
      }),
    ]);

    return resume;
  }

  async import(userId: string, importResumeDto: ImportResumeDto) {
    const randomTitle = generateRandomName();

    const resume = await this.firebaseService.create("resumeCollection", {
      dto: {
        userId,
        visibility: "private",
        data: importResumeDto.data,
        title: importResumeDto.title || randomTitle,
        slug: importResumeDto.slug || kebabCase(randomTitle),
      },
    });

    await Promise.all([
      this.redis.del(`user:${userId}:resumes`),
      this.redis.set(`user:${userId}:resume:${resume.id}`, JSON.stringify(resume)),
      this.usageService.changeFieldByNumberBy1(userId, {
        action: "increment",
        field: "resumes",
      }),
    ]);

    return resume;
  }

  findAll(userId: string) {
    return this.utils.getCachedOrSet(`user:${userId}:resumes`, async () =>
      await this.firebaseService.findManyAndOrder(
        "resumeCollection",
        { condition: { field: "userId", value: userId } },
        { order: { field: "updatedAt", by: "desc" } },
      ),
    );
  }

  async findOne(id: string, userId: string = "") {
    if (userId) {
      return this.utils.getCachedOrSet(
        `user:${userId}:resume:${id}`,
        async () =>
          await this.firebaseService.findUniqueOrThrow("resumeCollection", {
            condition: { field: "userId", value: id },
          }),
      );
    }

    await this.usageService.changeFieldByNumberBy1(userId, {
      action: "increment",
      field: "views",
    });

    return this.utils.getCachedOrSet(
      `user:public:resume:${id}`,
      async () =>
        await this.firebaseService.findUniqueOrThrow("resumeCollection", {
          condition: { field: "id", value: id },
        }),
    );
  }

  async findOneStatistics(userId: string, id: string) {
    const result = await Promise.all([
      this.redis.get(`user:${userId}:resume:${id}:views`),
      this.redis.get(`user:${userId}:resume:${id}:downloads`),
    ]);

    const [views, downloads] = result.map((value) => Number(value) || 0);

    return { views, downloads };
  }

  async findOneUsage(userId: string) {
    return await this.usageService.findOneByUserId(userId);
  }

  async findOneByUsernameSlug(username: string, slug: string, userId: string = "") {
    const resume = await this.firebaseService.findFirstResumeOrThrow({
      conditions: {
        user: {
          field: "user",
          value: { username },
        },
        slug: {
          field: "slug",
          value: slug,
        },
        visibility: {
          field: "visibility",
          value: "public",
        },
      },
    });

    // Update statistics: increment the number of views by 1
    await this.usageService.changeFieldByNumberBy1(userId, {
      action: "increment",
      field: "views",
    });

    //if (!userId) await this.redis.incr(`user:${resume.userId}:resume:${resume.id}:views`);

    return resume;
  }

  async update(userId: string, id: string, updateResumeDto: UpdateResumeDto) {
    const { locked } = await this.firebaseService.findUniqueOrThrow(
      "resumeCollection",
      {
        condition: {
          field: "id",
          value: id,
        },
      },
      { select: ["locked"] },
    );

    if (locked) throw new BadRequestException(ErrorMessage.ResumeLocked);

    const resume = await this.firebaseService.updateItem(
      "resumeCollection",
      {
        condition: {
          field: "id",
          value: id,
        },
      },
      {
        dto: {
          title: updateResumeDto.title,
          slug: updateResumeDto.slug,
          visibility: updateResumeDto.visibility,
          data: updateResumeDto.data,
        },
      },
    );

    await Promise.all([
      this.redis.set(`user:${userId}:resume:${id}`, JSON.stringify(resume)),
      this.redis.del(`user:${userId}:resumes`),
    ]);

    return resume;
  }

  async lock(userId: string, id: string, set: boolean) {
    const resume = await this.firebaseService.updateItem(
      "resumeCollection",
      {
        condition: {
          field: "userId_id",
          value: { userId, id },
        },
      },
      {
        dto: {
          locked: set,
        },
      },
    );

    await Promise.all([
      this.redis.set(`user:${userId}:resume:${id}`, JSON.stringify(resume)),
      this.redis.del(`user:${userId}:resumes`),
    ]);

    return resume;
  }

  async remove(userId: string, id: string) {
    await Promise.all([
      // Remove cached keys
      this.redis.del(`user:${userId}:resumes`),
      this.redis.del(`user:${userId}:resume:${id}`),

      // Remove files in bucket, and their cached keys
      this.firebaseService.deleteObject(userId, "resumes", id),
      this.firebaseService.deleteObject(userId, "previews", id),

      this.usageService.deleteByUserId(userId),
      this.usageService.changeFieldByNumberBy1(userId, {
        action: "decrement",
        field: "resumes",
      }),
    ]);

    return this.firebaseService.deleteByDocId("resumeCollection", id);
  }

  async printResume(resume: ResumeDto, userId: string = "") {
    const url = await this.printerService.printResume(resume);

    // Update statistics: increment the number of downloads by 1
    this.usageService.changeFieldByNumberBy1(userId, {
      action: "increment",
      field: "downloads",
    });

    return url;
  }

  async printPreview(resume: ResumeDto) {
    return await this.printerService.printPreview(resume);
  }
}
