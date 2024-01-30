import {
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Body
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
import { PlanService } from "./plan.service";

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
  async create(@Body() plans: any) {
    return await this.planService.create(plans);
  }

  @Post("")
  @UseGuards(TwoFactorGuard)
  async update(@Param('id') id: string, @Body() planUpdate: any) {
    return await this.planService.updateById(id, planUpdate);
  }
}
