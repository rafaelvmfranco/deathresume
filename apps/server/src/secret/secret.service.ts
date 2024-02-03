import { Injectable } from "@nestjs/common";

import { FirebaseService } from "../firebase/firebase.service";

@Injectable()
export class SecretService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getSecretByUserId(userId: string) {
    return await this.firebaseService.findUnique("secretCollection", {
      condition: {
        field: "userId",
        value: userId,
      },
    });
  }

  async addSecret(userId: string, secretDto: any) {
    return await this.firebaseService.create("secretCollection", {
      dto: {
        ...secretDto,
        userId,
      },
    });
  }
}
