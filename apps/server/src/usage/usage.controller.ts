import { Body, Controller, Delete, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserDto } from "@reactive-resume/dto";
import { UpdateUsageDto } from "@reactive-resume/dto";
import { User } from "@/server/user/decorators/user.decorator";
import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
import { UsageService } from "./usage.service";

@ApiTags("Usage")
@Controller("usage")
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get()
  @UseGuards(TwoFactorGuard)
  async findByUser(@User() user: UserDto) {
    return await this.usageService.findOneByUserId(user.id);
  }

  @Post()
  @UseGuards(TwoFactorGuard)
  async create(@User() user: UserDto) {
    return await this.usageService.create(user.id);
  }

  @Patch()
  @UseGuards(TwoFactorGuard)
  async changeFieldNumber(@User() user: UserDto, @Body() updateDto: UpdateUsageDto) {
    if (updateDto.field === "alWords") return await this.usageService.addAlWords(user.id, updateDto.value);
    return await this.usageService.changeFieldByNumberBy1(user.id, updateDto);
  }

  @Delete()
  @UseGuards(TwoFactorGuard)
  async remove(@User() user: UserDto) {
    return await this.usageService.deleteByUserId(user.id);
  }
}
