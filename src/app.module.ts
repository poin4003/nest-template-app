import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './common/logger/logger.module';
import { validate } from 'class-validator';
import { AppConfigModule } from './config/settings/app-config.module';
import { PrismaModule } from './core/database/prisma.module';
import { RedisModule } from './core/redis/redis.module';
import { AppConfigService } from './config/settings/app-config.service';
import { ActionLogModule } from './modules/action-logs/action-log.module';
import { VnSkyModule } from './modules/vn-sky/vn-sky.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
	imports: [
		ConfigModule.forRoot({
			validate,
			isGlobal: true,
		}),
		BullModule.forRootAsync({
			imports: [AppConfigModule],
			inject: [AppConfigService],
      useFactory: (settings: AppConfigService) => ({
        connection: {
          host: settings.REDIS_HOST,
          port: settings.REDIS_PORT,
          password: settings.REDIS_PASSWORD,
        },
      }),
		}),
		AppConfigModule,
		PrismaModule,
		RedisModule,
		LoggerModule,
    ActionLogModule,
    VnSkyModule,
	],
})
export class AppModule {}
