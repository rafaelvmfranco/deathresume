import {
  BadRequestException,
  Injectable,
  Logger,
} from "@nestjs/common";
import {
  CreateResumeDto,
  ImportResumeDto,
  ResumeDto,
  UpdateResumeDto,
  ResumeWithStrigifiedLayout,
} from "@reactive-resume/dto";
import {
  defaultResumeData,
  ResumeData,
  ResumeDataWithStringifiedLayout,
} from "@reactive-resume/schema";
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
export class ResumeService {
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
    const { name, email, picture } = await this.firebaseService.findUniqueByIdOrThrow(
      "userCollection",
      { id: userId },
      { select: ["name", "email", "picture"] },
    );

    const data = deepmerge(defaultResumeData, {
      basics: { name, email, picture: { url: picture ?? "" } },
    } satisfies DeepPartial<ResumeData>);

    const resumeDto = this.stringifyResumeLayout(data);

    const resume = (await this.firebaseService.create("resumeCollection", {
      dto: {
        data: resumeDto,
        userId,
        title: createResumeDto.title,
        visibility: createResumeDto.visibility,
        slug: createResumeDto.slug ?? kebabCase(createResumeDto.title),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })) as ResumeWithStrigifiedLayout;

    await Promise.all([
      this.redis.del(`user:${userId}:resumes`),
      this.redis.set(`user:${userId}:resume:${resume.id}`, JSON.stringify(resume)),
      this.usageService.changeFieldByNumberBy1(userId, {
        action: "increment",
        field: "resumes",
      }),
    ]);

    return this.parseResumeLayout(resume);
  }

  async import(userId: string, importResumeDto: ImportResumeDto) {
    const randomTitle = generateRandomName();

    const resumeData = this.stringifyResumeLayout(importResumeDto.data);

    const resume = (await this.firebaseService.create("resumeCollection", {
      dto: {
        userId,
        visibility: "private",
        data: resumeData,
        title: importResumeDto.title || randomTitle,
        slug: importResumeDto.slug || kebabCase(randomTitle),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })) as ResumeWithStrigifiedLayout;

    await Promise.all([
      this.redis.del(`user:${userId}:resumes`),
      this.redis.set(`user:${userId}:resume:${resume.id}`, JSON.stringify(resume)),
      this.usageService.changeFieldByNumberBy1(userId, {
        action: "increment",
        field: "resumes",
      }),
    ]);

    return this.parseResumeLayout(resume);
  }

  findAll(userId: string) {
    return this.utils.getCachedOrSet(`user:${userId}:resumes`, async () => {
      const resumes = await this.firebaseService.findMany(
        "resumeCollection",
        { condition: { field: "userId", value: userId } },
        { order: { field: "updatedAt", by: "desc" } },
      );

      return resumes.map((resume: ResumeWithStrigifiedLayout) => this.parseResumeLayout(resume));
    });
  }

  async findOne(id: string, userId?: string) {
    if (userId) {
      return this.utils.getCachedOrSet(`user:${userId}:resume:${id}`, async () => {
        const resume = (await this.firebaseService.findUniqueOrThrow(
          "resumeCollection",
          {
            condition: { field: "userId", value: userId },
          },
          { select: [] },
          { id },
        )) as ResumeWithStrigifiedLayout;

        await this.usageService.changeFieldByNumberBy1(userId || "", {
          action: "increment",
          field: "views",
        });

        Logger.log(" this.parseResumeLayout(resume)", this.parseResumeLayout(resume));

        return this.parseResumeLayout(resume);
      });
    }

    return this.utils.getCachedOrSet(`user:public:resume:${id}`, async () => {
      const resume = (await this.firebaseService.findUniqueByIdOrThrow("resumeCollection", {
        id,
      })) as ResumeWithStrigifiedLayout;

      await this.usageService.changeFieldByNumberBy1(userId || "", {
        action: "increment",
        field: "views",
      });

      Logger.log(" this.parseResumeLayout(resume)", this.parseResumeLayout(resume));
      return this.parseResumeLayout(resume);
    });
  }

  async findOneStatistics(userId: string, id: string) {
    const result = await Promise.all([
      this.redis.get(`user:${userId}:resume:${id}:views`),
      this.redis.get(`user:${userId}:resume:${id}:downloads`),
    ]);

    const [views, downloads] = result.map((value) => Number(value) || 0);

    return { views, downloads };
  }

  async findOneByUsernameSlug(username: string, slug: string, userId: string = "") {
    const user = await this.firebaseService.findUniqueOrThrow("userCollection", {
      condition: { field: "username", value: username },
    });

    const resume = (await this.firebaseService.findFirstOrThrow("resumeCollection", {
      conditions: [
        {
          field: "userId",
          value: user.id,
        },
        {
          field: "slug",
          value: slug,
        },
        {
          field: "visibility",
          value: "public",
        },
      ],
    })) as ResumeWithStrigifiedLayout;

    if (!userId) await this.redis.incr(`user:${resume.userId}:resume:${resume.id}:views`);

    return this.parseResumeLayout(resume);
  }

  async update(userId: string, id: string, updateResumeDto: UpdateResumeDto) {
    const { locked } = await this.firebaseService.findUniqueOrThrow(
      "resumeCollection",
      {
        condition: {
          field: "userId",
          value: userId,
        },
      },
      { select: ["locked"] },
      { id },
    );

    if (locked) throw new BadRequestException(ErrorMessage.ResumeLocked);

    const resume = (await this.firebaseService.updateItem(
      "resumeCollection",
      {
        condition: {
          field: "userId",
          value: userId,
        },
      },
      {
        dto: {
          title: updateResumeDto.title,
          slug: updateResumeDto.slug,
          visibility: updateResumeDto.visibility,
          data: this.stringifyResumeLayout((updateResumeDto as any).data),
          updatedAt: new Date().toISOString(),
        },
      },
      { id },
    )) as ResumeWithStrigifiedLayout;

    await Promise.all([
      this.redis.set(`user:${userId}:resume:${id}`, JSON.stringify(resume)),
      this.redis.del(`user:${userId}:resumes`),
    ]);

    return this.parseResumeLayout(resume);
  }

  async lock(userId: string, id: string, set: boolean) {
    const resume = (await this.firebaseService.updateItem(
      "resumeCollection",
      {
        condition: {
          field: "userId",
          value: userId,
        },
      },
      {
        dto: {
          locked: set,
          updatedAt: new Date().toISOString(),
        },
      },
      { id },
    )) as ResumeWithStrigifiedLayout;

    await Promise.all([
      this.redis.set(`user:${userId}:resume:${id}`, JSON.stringify(resume)),
      this.redis.del(`user:${userId}:resumes`),
    ]);

    return this.parseResumeLayout(resume);
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

    const response = await this.firebaseService.deleteByDocId("resumeCollection", id);
    return this.parseResumeLayout(response);
  }

  async printResume(resume: ResumeWithStrigifiedLayout, userId: string = "", isPublic: boolean) {
    const parsedResume = this.parseResumeLayout(resume);
    const url = await this.printerService.printResume(parsedResume);

    if (!isPublic)
      await this.usageService.changeFieldByNumberBy1(userId, {
        action: "increment",
        field: "downloads",
      });

    return url;
  }

  async printPreview(resume: ResumeWithStrigifiedLayout) {
    console.log("preview", resume?.data.metadata.layout);
    const parsedResume = this.parseResumeLayout(resume);

    return await this.printerService.printPreview(parsedResume);
  }

  parseResumeLayout(resume: ResumeWithStrigifiedLayout): ResumeDto {
    return {
      ...resume,
      data: {
        ...resume.data,
        metadata: {
          ...resume.data.metadata,
          layout: JSON.parse(resume.data.metadata.layout),
        },
      },
    };
  }

  stringifyResumeLayout(resumeData: ResumeData): ResumeDataWithStringifiedLayout {
    return {
      ...resumeData,
      metadata: {
        ...resumeData.metadata,
        layout: JSON.stringify(resumeData.metadata.layout),
      },
    };
  }
}
