import { forwardRef, Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { FirebaseModule } from "../firebase/firebase.module";
import { StorageModule } from "../storage/storage.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [forwardRef(() => AuthModule.register()), FirebaseModule, StorageModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
