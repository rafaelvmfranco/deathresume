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

  async increaseFieldNumberBy1(userId: string, updateField: UpdateFields) {
    return await this.firebaseService.increaseFieldByNumber(
      "usageCollection",
      {
        condition: {
          field: "userId",
          value: userId,
        },
      },
      {
        dto: {
          field: updateField,
          value: 1,
        },
      },
    );
  }
}
