import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { User as UserEntity } from "@prisma/client";
import { SubscriptionWithPlan } from "@reactive-resume/dto";
import { User } from "@/server/user/decorators/user.decorator";
import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
import { SubscriptionService } from "./subscription.service";

@ApiTags("Subscription")
@Controller("subscription")
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @UseGuards(TwoFactorGuard)
  async findByUserId(@User() user: UserEntity): Promise<SubscriptionWithPlan> {
    return await this.subscriptionService.getByUserId(user.id);
  }
}
