import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
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

  @Get("show")
  @UseGuards(TwoFactorGuard)
  ifShowOne(@User() user: UserEntity) {
    return this.subscriptionService.ifShowResume(user.id);
  }

  @Post("")
  @UseGuards(TwoFactorGuard)
  create(@Body() body: { stripePriceId: string; userEmail: string }) {
    return this.subscriptionService.create(body.stripePriceId, body.userEmail);
  }

  @Post("webhook")
  async handleWebhook(@Headers('stripe-signature') signature: string, @Req() req: RawBodyRequest<Request>) {
    const rawReq = req.rawBody;
    return await this.subscriptionService.handleWebhook(rawReq, signature);
  }

  @Patch("")
  @UseGuards(TwoFactorGuard)
  update(@Body() body: { stripePriceId: string; subscriptionId: string }) {

    return this.subscriptionService.update(body.stripePriceId, body.subscriptionId);
  }
}
