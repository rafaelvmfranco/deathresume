import { forwardRef, Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { FirebaseModule } from "../firebase/firebase.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { FirebaseUserService } from "./firebase-user.service";

@Module({
  imports: [forwardRef(() => AuthModule.register()), FirebaseModule],
  controllers: [UserController],
  providers: [UserService, FirebaseUserService],
  exports: [UserService, FirebaseUserService],
})
export class UserModule {}
