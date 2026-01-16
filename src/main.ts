import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MyLoggerService } from './common/logger/my-logger.service';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './config/env.validation';
import { GlobalExceptionFilter } from './core/filter/global-exception.filter';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	const configService = app.get(ConfigService<EnvironmentVariables>);
	const appPort = configService.get('APP_PORT', { infer: true });

	app.useLogger(app.get(MyLoggerService));
	app.useGlobalPipes(new ValidationPipe());
	app.useGlobalFilters(new GlobalExceptionFilter());

	await app.listen(appPort || 3000);
}
bootstrap();
