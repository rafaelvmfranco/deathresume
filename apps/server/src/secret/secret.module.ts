import { Module } from "@nestjs/common";

import { SecretService } from "./secret.service";
import { FirebaseModule } from "../firebase/firebase.module";

@Module({
  imports: [FirebaseModule],
  providers: [SecretService],
  exports: [SecretService],
})
export class SecretModule {}
