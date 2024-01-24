import { HttpException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { UserDto, UserWithSecrets } from "@reactive-resume/dto";
import { ErrorMessage } from "@reactive-resume/utils";
import { RedisService } from "@songkeys/nestjs-redis";
import Redis from "ioredis";
import { FirebaseRepository } from "../firebase/firebase.repository";

@Injectable()
export class FirebaseUserService {
  private readonly redis: Redis;

  constructor(
    private readonly redisService: RedisService,
    private readonly firebaseRepository: FirebaseRepository,
  ) {
    this.redis = this.redisService.getClient();
  }

  async findOneById(id: string) {
    const user = await this.firebaseRepository.findByField("userCollection", {
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
    const user = await this.firebaseRepository.findByField("userCollection", {
      field: "email",
      value: identifier,
    });

    if (user) return user;

    const userByName = await this.firebaseRepository.findByField("userCollection", {
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
    return await this.firebaseRepository.create("userCollection", data);
  }

  async updateByEmail(email: string, data: Prisma.UserUpdateArgs["data"]) {
    return await this.firebaseRepository.updateItemByField(
      "userCollection",
      { field: "email", value: email },
      data,
    );
  }

  async updateByResetToken(resetToken: string, data: Prisma.SecretsUpdateArgs["data"]) {
    await this.firebaseRepository.updateItemByField(
      "userCollection",
      { field: "resetToken", value: resetToken },
      data,
    );
  }

  async deleteOneById(id: string) {
    await Promise.all([
      this.redis.del(`user:${id}:*`),
      this.firebaseRepository.deleteBucketFolderById(id),
    ]);

    await this.firebaseRepository.deleteByField("userCollection", {
      field: "id",
      value: id,
    });
  }
}
