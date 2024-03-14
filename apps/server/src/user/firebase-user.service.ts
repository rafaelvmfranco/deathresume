import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { firestore } from "firebase-admin";
import { UserWithSecrets } from "@reactive-resume/dto";
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
    const user = (await this.firebaseService.findUniqueOrThrow("userCollection", {
      condition: {
        field: "id",
        value: id,
      },
    })) as UserWithSecrets;

    if (!user?.secrets) {
      throw new InternalServerErrorException(ErrorMessage.SecretsNotFound);
    }

    return user;
  }

  async findOneByIdentifier(identifier: string) {
    const userByEmail = (await this.firebaseService.findUnique("userCollection", {
      condition: {
        field: "email",
        value: identifier,
      },
    })) as UserWithSecrets;

    if (!userByEmail?.secrets) {
      throw new InternalServerErrorException(ErrorMessage.SecretsNotFound);
    }

    if (userByEmail) return userByEmail;

    const userByName = (await this.firebaseService.findUniqueOrThrow("userCollection", {
      condition: {
        field: "username",
        value: identifier,
      },
    })) as UserWithSecrets;

    if (userByName?.secrets) {
      throw new InternalServerErrorException(ErrorMessage.SecretsNotFound);
    }

    return userByName;
  }

  async create(data: any) {
    const userId = createId();
    
    const createDto = data?.secrets?.create
      ? {
          ...data,
          secrets: {
            id: userId,
            ...data?.secrets.create,
            lastSignedIn: firestore.FieldValue.serverTimestamp(),
            verificationToken: null,
            twoFactorSecret: null,
            twoFactorBackupCodes: [],
            refreshToken: null,
            resetToken: null,
          },
          createdAt: firestore.FieldValue.serverTimestamp(),
        }
      : data;

    const user = await this.firebaseService.create(
      "userCollection",
      {
        dto: createDto,
      },
      userId,
    );
    return user;
  }

  async updateByEmail(email: string, data: any) {
    const updateDto = data?.secrets ? { secrets: data.secrets.update } : data;

    return await this.firebaseService.updateItem(
      "userCollection",
      { condition: { field: "email", value: email } },
      { dto: { ...updateDto, updatedAt: firestore.FieldValue.serverTimestamp() } },
    );
  }

  async updateByResetToken(resetToken: string, data: any) {
    const updateDto = data?.secrets ? { secrets: data.secrets.update } : data;

    await this.firebaseService.updateItem(
      "userCollection",
      { condition: { field: "resetToken", value: resetToken } },
      { dto: { ...updateDto, updatedAt: firestore.FieldValue.serverTimestamp() } },
    );
  }

  async deleteOneById(id: string) {
    await Promise.all([this.redis.del(`user:${id}:*`), this.firebaseService.deleteFolder(id)]);

    return await this.firebaseService.deleteByDocId("userCollection", id);
  }
}
