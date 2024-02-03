import { Module } from "@nestjs/common";

import { SubcriptionService } from "./subcription.service";
import { FirebaseModule } from "../firebase/firebase.module";

@Module({
  imports: [FirebaseModule],
  providers: [SubcriptionService],
  exports: [SubcriptionService],
})
export class SubcriptionModule {}
