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
    const user = await this.firebaseService.findByField("userCollection", {
      field: "id",
      value: id,
    });

    if (!user) throw new HttpException(ErrorMessage.UserNotFound, 404);

    if (!(user as any).secrets) {
      throw new InternalServerErrorException(ErrorMessage.SecretsNotFound);
    }

    return user;
  }

  async findOneByIdentifier(identifier: string) {
    const user = await this.firebaseService.findByField("userCollection", {
      field: "email",
      value: identifier,
    });

    if (user) return user;

    const userByName = await this.firebaseService.findByField("userCollection", {
      field: "username",
      value: identifier,
    });

    if (!userByName) throw new HttpException(ErrorMessage.UserNotFound, 404);

    if (!(userByName as any).secrets) {
      throw new InternalServerErrorException(ErrorMessage.SecretsNotFound);
    }

    return userByName;
  }

  async create(data: Prisma.UserCreateInput) {
    return await this.firebaseService.create("userCollection", data);
  }

  async updateByEmail(email: string, data: Prisma.UserUpdateArgs["data"]) {
    return await this.firebaseService.updateItemByField(
      "userCollection",
      { field: "email", value: email },
      data,
    );
  }

  async updateByResetToken(resetToken: string, data: Prisma.SecretsUpdateArgs["data"]) {
    await this.firebaseService.updateItemByField(
      "userCollection",
      { field: "resetToken", value: resetToken },
      data,
    );
  }

  async deleteOneById(id: string) {
    await Promise.all([
      this.redis.del(`user:${id}:*`),
      this.firebaseService.deleteBucketFolderById(id),
    ]);

    await this.firebaseService.deleteByField("userCollection", {
      field: "id",
      value: id,
    });
  }
}
