import { forwardRef, Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { FirebaseModule } from "../firebase/firebase.module";
import { UserController } from "./user.controller";
import { PrismaUserService } from "./prisma-user.service";
import { UserService } from "./user.service";
import { UsageModule } from "../usage/usage.module";
import { SubscriptionModule } from "../subscription/subscription.module";

@Module({
  imports: [forwardRef(() => AuthModule.register()), FirebaseModule, UsageModule, SubscriptionModule],
  controllers: [UserController],
  providers: [PrismaUserService, UserService],
  exports: [PrismaUserService, UserService],
})
export class UserModule {}
