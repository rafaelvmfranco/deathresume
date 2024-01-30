import { Injectable } from "@nestjs/common";

import { FirebaseService } from "../firebase/firebase.service";
import { UpdateFields } from "@reactive-resume/dto";

@Injectable()
export class UsageService {
  constructor(private readonly firebaseService: FirebaseService) {}

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
