import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './common/logger/logger.module';
import { validate } from 'class-validator';
import { SimsModule } from './modules/sims/sims.module';
import { AppConfigModule } from './config/app-config.module';
import { PrismaModule } from './core/database/prisma.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			validate,
			isGlobal: true,
		}),
    AppConfigModule,
    PrismaModule,
		LoggerModule,
		SimsModule,
	],
})
export class AppModule {}
