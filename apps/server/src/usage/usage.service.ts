import { Injectable } from "@nestjs/common";

import { FirebaseService } from "../firebase/firebase.service";

@Injectable()
export class UsageService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(userId: string): Promise<any> {
    return await this.firebaseService.create("usageCollection", {
      dto: {
        userId,
        resumes: 0,
        downloads: 0,
        views: 0,
        alWords: 0,
      },
    });
  }

  async findOneByUserId(userId: string): Promise<any> {
    return await this.firebaseService.findUnique("usageCollection", {
      condition: {
        field: "userId",
        value: userId,
      },
    });
  }

  async changeFieldByNumberBy1(userId: string, updateDto: any) {
    return await this.firebaseService.changeFieldByNumber(
      "usageCollection",
      {
        condition: {
          field: "userId",
          value: userId,
        },
      },
      {
        dto: {
          field: updateDto.field,
          value: 1,
        },
      },
      updateDto.action,
    );
  }

  async addAlWords(userId: string, alWordsAmount: number) {
    return await this.firebaseService.changeFieldByNumber(
      "usageCollection",
      {
        condition: {
          field: "userId",
          value: userId,
        },
      },
      {
        dto: {
          field: "alWords",
          value: alWordsAmount,
        },
      },
      "increment",
    );
  }

  async deleteByUserId(userId: string) {
    return await this.firebaseService.deleteByField("usageCollection", {
      condition: {
        field: "userId",
        value: userId,
      },
    });
  }
}
