import { ConfigModule } from "@nestjs/config";
import { AppConfigService } from "./app-config.service";
import { validate } from "./env.validation";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validate,
      isGlobal: true,
    })
  ],
  providers: [AppConfigService],
  exports: [AppConfigService]
})
export class AppConfigModule {}
