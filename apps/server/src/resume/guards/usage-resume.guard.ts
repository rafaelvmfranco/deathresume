import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { UserDto, UserWithSecrets } from "@reactive-resume/dto";
import { ErrorMessage } from "@reactive-resume/utils";
import { Request } from "express";

import { UsageService } from "../../usage/usage.service";
import { SubscriptionService } from "@/server/subscription/subscription.service";

@Injectable()
export class UsageResumeGuard implements CanActivate {
  constructor(
    private readonly usageService: UsageService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as UserWithSecrets | false;

    const usage = await this.usageService.findOneByUserId((user as UserDto).id);
    const subscription = await this.subscriptionService.getByUserId((user as UserDto).id);

    const period = subscription.period;

    const plan = subscription.plan[period].max;

    let usageErrorText = "";

    if ((plan as any)?.views < usage.views) {
      usageErrorText += "views ";
    }
    if ((plan as any)?.resumes < usage.resumes) {
      usageErrorText += "resumes ";
    }
    if ((plan as any)?.alWords < usage.alWords) {
      usageErrorText += "Al Words ";
    }
    if ((plan as any)?.downloads < usage.downloads) {
      usageErrorText += "downloads";
    }

    if (usageErrorText.length > 0) {
      throw new NotFoundException(ErrorMessage.PaymentPeriodEnded + usageErrorText);
    }

    return true;
  }
}
