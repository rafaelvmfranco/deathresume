import { Injectable } from "@nestjs/common";

import { FirebaseService } from "../firebase/firebase.service";
import { UpdateFields } from "@reactive-resume/dto";

@Injectable()
export class UsageService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(userId: string) {
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

  async findOneByUserId(userId: string) {
    return await this.firebaseService.findUnique("usageCollection", {
      condition: {
        field: "userId",
        value: userId,
      },
    });
  }

  async changeFieldByNumberBy1(userId: string, updateDto: UpdateUsageDto) {
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
      updateDto.action
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
