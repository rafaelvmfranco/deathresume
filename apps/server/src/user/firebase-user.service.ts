import { HttpException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { UserDto, UserWithSecrets } from "@reactive-resume/dto";
import { ErrorMessage } from "@reactive-resume/utils";
import { RedisService } from "@songkeys/nestjs-redis";
import Redis from "ioredis";
import { FirebaseService } from "../firebase/firebase.service";

@Injectable()
export class FirebaseUserService {
  private readonly redis: Redis;

  constructor(
    private readonly redisService: RedisService,
    private readonly firebaseService: FirebaseService,
  ) {
    this.redis = this.redisService.getClient();
  }

  async findOneById(id: string) {
    const user = await this.firebaseService.findUniqueOrThrow(
      "userCollection",
      {
        condition: {
          field: "id",
          value: id,
        },
      },
      undefined,
      {
        includeSecret: true,
      },
    );

    if (!(user as any).secrets) {
      throw new InternalServerErrorException(ErrorMessage.SecretsNotFound);
    }

    return user;
  }

  async findOneByIdentifier(identifier: string) {
    const user = await this.firebaseService.findUnique(
      "userCollection",
      {
        condition: {
          field: "email",
          value: identifier,
        },
      },
      undefined,
      {
        includeSecret: true,
      },
    );

    if (user) return user;

    const userByName = await this.firebaseService.findUniqueOrThrow(
      "userCollection",
      {
        condition: {
          field: "username",
          value: identifier,
        },
      },
      undefined,
      {
        includeSecret: true,
      },
    );

    if (!(userByName as any).secrets) {
      throw new InternalServerErrorException(ErrorMessage.SecretsNotFound);
    }

    return userByName;
  }

  async create(data: Prisma.UserCreateInput) {
    return await this.firebaseService.create("userCollection", data, {
      includeSecret: true,
    });
  }

  async updateByEmail(email: string, data: Prisma.UserUpdateArgs["data"]) {
    return await this.firebaseService.updateItem(
      "userCollection",
      { condition: { field: "email", value: email } },
      { dto: data },
    );
  }

  async updateByResetToken(resetToken: string, data: Prisma.SecretsUpdateArgs["data"]) {
    await this.firebaseService.updateItem(
      "secretCollection",
      { condition: { field: "resetToken", value: resetToken } },
      { dto: data },
    );
  }

  async deleteOneById(id: string) {
    await Promise.all([
      this.redis.del(`user:${id}:*`),
      this.firebaseService.deleteBucketFolderById(id),
    ]);

    await this.firebaseService.deleteByField("userCollection", {
      condition: { field: "id", value: id },
    });
  }
}
