import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MyLoggerService } from './common/logger/my-logger.service';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './config/settings/env.validation';
import { GlobalExceptionFilter } from './core/filter/global-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	const config = new DocumentBuilder()
		.setTitle('NestJS API')
		.setDescription('NestJS Api')
		.setVersion('1.0')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	const configService = app.get(ConfigService<EnvironmentVariables>);
	const appPort = configService.get('APP_PORT', { infer: true });

	app.useLogger(app.get(MyLoggerService));
	app.useGlobalPipes(new ValidationPipe({
    transform: true
  }));
	app.useGlobalFilters(new GlobalExceptionFilter());

	SwaggerModule.setup('api', app, document);

	await app.listen(appPort || 3000);
}
bootstrap();
