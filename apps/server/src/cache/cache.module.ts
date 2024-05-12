import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RedisModule } from "@songkeys/nestjs-redis";

import { Config } from "../config/schema";

@Module({
  imports: [
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Config>) => ({
        config: {
          url: configService.getOrThrow("IS_CONTAINER") == "true"
            ? configService.getOrThrow("REDIS_URL_CONTAINER")
            : configService.getOrThrow("REDIS_URL"),
        },
      }),
    }),
  ],
})
export class CacheModule {}
