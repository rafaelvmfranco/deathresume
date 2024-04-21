import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { UserDto, UserWithSecrets } from "@reactive-resume/dto";
import { ErrorMessage } from "@reactive-resume/utils";
import { Request } from "express";

import { SubscriptionService } from "@/server/subscription/subscription.service";

@Injectable()
export class PaymentResumeGuard implements CanActivate {
  constructor(
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as UserWithSecrets | false;

    const subscription = await this.subscriptionService.getByUserId((user as UserDto).id);

    const activeUntil = subscription.activeUntil;
    let isPaid = Boolean(activeUntil * 1000 > Number(new Date()));

    if (!isPaid) {
      throw new NotFoundException(ErrorMessage.PaymentPeriodEnded);
    }

    return true;
  }
}
