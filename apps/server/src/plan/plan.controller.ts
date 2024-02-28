import {
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Body,
  Put
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
import { PlanService } from "./plan.service";
import { PlanDto } from "@reactive-resume/dto";

@ApiTags("Plans")
@Controller("plans")
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get("")
  @UseGuards(TwoFactorGuard)
  async getAll() {
    return await this.planService.getAll();
  }

  @Post("")
   @UseGuards(TwoFactorGuard)
  async create(@Body() plan: PlanDto) {
    return await this.planService.createOne(plan);
  }

}
