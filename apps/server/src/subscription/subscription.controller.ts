import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  Headers,
  Req,
  RawBodyRequest,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SubscriptionWithPlan, UserDto } from "@reactive-resume/dto";
import { User } from "@/server/user/decorators/user.decorator";
import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
import { SubscriptionService } from "./subscription.service";

@ApiTags("Subscription")
@Controller("subscription")
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @UseGuards(TwoFactorGuard)
  async findByUserId(@User() user: UserDto): Promise<SubscriptionWithPlan> {
    return await this.subscriptionService.getByUserId(user.id);
  }

  @Get("show")
  @UseGuards(TwoFactorGuard)
  ifShowOne(@User() user: UserDto) {
    return this.subscriptionService.ifShowResume(user.id);
  }

  @Post("")
  @UseGuards(TwoFactorGuard)
  create(@User() user: UserDto, @Body("stripePriceId") stripePriceId: string) {
    return this.subscriptionService.create(user, stripePriceId);
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
