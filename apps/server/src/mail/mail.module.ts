import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MailerModule } from "@nestjs-modules/mailer";
import * as nodemailer from "nodemailer";

import { Config } from "@/server/config/schema";

import { MailService } from "./mail.service";

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>) => {
        const from = configService.get("MAIL_FROM");
        const isProduction = configService.get("NODE_ENV") === "production";

        if (!isProduction) {
          Logger.warn(
            "In NODE_ENV = development, emails would be logged to the console instead. This is not recommended for production environments.",
            "MailModule",
          );
        }

        return {
          defaults: { from },
          transport: {
            host: configService.get("SMTP_SERVER"),
            port: configService.get("SMTP_PORT"),
            secure: false,
            ignoreTLS: true,
            logger: !isProduction,
            auth: {
              user: configService.get("SMTP_USER"),
              pass: configService.get("SMTP_KEY"),
            },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule { }
