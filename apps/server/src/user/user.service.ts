import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { UserDto, UserWithSecrets } from "@reactive-resume/dto";
import { ErrorMessage } from "@reactive-resume/utils";
import { RedisService } from "@songkeys/nestjs-redis";
import Redis from "ioredis";
import { FirebaseService } from "../firebase/firebase.service";
import { UsageService } from "../usage/usage.service";
import { SubscriptionService } from "../subscription/subscription.service";
import { createId } from "@paralleldrive/cuid2";

@Injectable()
export class UserService {
  private readonly redis: Redis;

  constructor(
    private readonly redisService: RedisService,
    private readonly firebaseService: FirebaseService,
    private readonly usageService: UsageService,
    private readonly subscriptionService: SubscriptionService,
  ) {
    this.redis = this.redisService.getClient();
  }

  async findOneById(id: string) {
    const user = (await this.firebaseService.findUniqueByIdOrThrow("userCollection", {
      id,
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

    const dates = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("createDto", data);
    const createDto = data?.secrets?.create
      ? {
          ...data,
          picture: data.picture ?? null,
          secrets: {
            ...data?.secrets.create,
            id: createId(),
            userId: userId,
            verificationToken: null,
            twoFactorSecret: null,
            twoFactorBackupCodes: [],
            refreshToken: null,
            resetToken: null,
            lastSignedIn: new Date().toISOString()
          },
          ...dates,
        }
      : { ...data, ...dates };

    const user = (await this.firebaseService.create(
      "userCollection",
      {
        dto: createDto,
      },
      userId,
    )) as UserWithSecrets | UserDto;

    await Promise.all([
      this.usageService.create(userId),
      this.subscriptionService.setDefaultSubscription(userId),
    ]);

    return user;
  }

  async updateByEmail(email: string, data: any) {    
    const updateDto = data?.secrets ? { secrets: data.secrets.update } : data;

    const user = await this.firebaseService.updateItem(
      "userCollection",
      { condition: { field: "email", value: email } },
      { dto: { ...updateDto, updatedAt: new Date().toISOString() } },
    );

    delete (user as any).secrets;
    return user;
  }

  async updateByResetToken(resetToken: string, data: any) {
    const updateDto = data?.secrets ? { secrets: data.secrets.update } : data;

    await this.firebaseService.updateItem(
      "userCollection",
      { condition: { field: "resetToken", value: resetToken } },
      { dto: { ...updateDto, updatedAt: new Date().toISOString() } },
    );
  }

  async deleteOneById(id: string) {
    
    await Promise.all([
      this.redis.del(`user:${id}:*`),
      this.firebaseService.deleteFolder(id),
      this.usageService.deleteByUserId(id),
      this.subscriptionService.stopSubscription(id),
    ]);

    return await this.firebaseService.deleteByDocId("userCollection", id);
  }
}
