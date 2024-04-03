import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { User as UserEntity } from "@prisma/client";
import { UpdateUsageDto } from "@reactive-resume/dto";
import { User } from "@/server/user/decorators/user.decorator";
import { OptionalGuard } from "../auth/guards/optional.guard";
import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
import { SubcriptionService } from "./subcription.service";

@ApiTags("Subcription")
@Controller("subcription")
export class SubcriptionController {
  constructor(private readonly subcriptionService: SubcriptionService) {}

  @Get()
  @UseGuards(TwoFactorGuard)
  async findByUserId(@User() user: UserEntity) {
    return await this.subcriptionService.getByUserId(user.id);
  }
}
