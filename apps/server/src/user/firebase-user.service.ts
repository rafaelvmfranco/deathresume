import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { UserDto, SecretsDto } from "@reactive-resume/dto";
import { ErrorMessage } from "@reactive-resume/utils";
import { RedisService } from "@songkeys/nestjs-redis";
import Redis from "ioredis";
import { FirebaseService } from "../firebase/firebase.service";
import { SecretService } from "../secret/secret.service";

@Injectable()
export class FirebaseUserService {
  private readonly redis: Redis;

  constructor(
    private readonly redisService: RedisService,
    private readonly firebaseService: FirebaseService,
    private readonly secretService: SecretService
  ) {
    this.redis = this.redisService.getClient();
  }

  async findOneById(id: string) {
    const secrets = await this.secretService.getSecretByUserId(id);

    if (!secrets) {
      throw new InternalServerErrorException(ErrorMessage.SecretsNotFound);
    }

    const user = (await this.firebaseService.findUniqueOrThrow("userCollection", {
      condition: {
        field: "id",
        value: id,
      },
    })) as UserDto;

    return { ...user, secrets };
  }

  async findOneByIdentifier(identifier: string) {
    const userByEmail = (await this.firebaseService.findUnique("userCollection", {
      condition: {
        field: "email",
        value: identifier,
      },
    })) as UserDto;

    const secrets = await this.secretService.getSecretByUserId(userByEmail.id);

    if (!secrets) {
      throw new InternalServerErrorException(ErrorMessage.SecretsNotFound);
    }

    if (userByEmail) return { ...userByEmail, secrets };

    const userByName = await this.firebaseService.findUniqueOrThrow(
      "userCollection",
      {
        condition: {
          field: "username",
          value: identifier,
        },
      },
    ) as UserDto;

    const secretsByName = await this.secretService.getSecretByUserId(userByName.id);

    if (secretsByName) {                                                                                                            
      throw new InternalServerErrorException(ErrorMessage.SecretsNotFound);
    }

    return {...userByName, secrets: secretsByName};
  }

  async create(data: UserDto) {
    const user = await this.firebaseService.create(
      "userCollection",
      { dto: data },
    );
    const secrets = await this.secretService.addSecret(user.id, "");
    return { ...user, secrets };
  }

  async updateByEmail(email: string, data: UserDto) {
    return await this.firebaseService.updateItem(
      "userCollection",
      { condition: { field: "email", value: email } },
      { dto: data },
    );
  }

  async updateByResetToken(resetToken: string, data: UserDto) {
    await this.firebaseService.updateItem(
      "secretCollection",
      { condition: { field: "resetToken", value: resetToken } },
      { dto: data },
    );
  }

  async deleteOneById(id: string) {
    await Promise.all([
      this.redis.del(`user:${id}:*`),
      this.firebaseService.deleteFolder(id),
    ]);

    await this.firebaseService.deleteByField("userCollection", {
      condition: { field: "id", value: id },
    });
  }
}
