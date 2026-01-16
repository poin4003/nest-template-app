import { ConfigModule } from "@nestjs/config";
import { Global, Module } from "@nestjs/common";
import { AppConfigService } from "./app-config.service";
import { validate } from "./env.validation";

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
