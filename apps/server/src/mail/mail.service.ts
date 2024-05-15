import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";

import { Config } from "@/server/config/schema";

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly mailerService: MailerService,
  ) {}

  async sendEmail(options: ISendMailOptions) {
    const isProduction = this.configService.get("NODE_ENV") === "production";

    // If `NODE_ENV = development` is not set, log the email to the console
    if (!isProduction) {
      return Logger.log(options, "MailService#sendEmail");
    }

    return await this.mailerService.sendMail(options);
  }
}
