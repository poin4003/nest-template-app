import { IntersectionType } from '@nestjs/mapped-types';
import { plainToInstance, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
	Development = 'development',
	Production = 'production',
}

class AppEnvironment {
	@IsEnum(Environment)
	NODE_ENV: Environment = Environment.Development;

	@IsString()
	APP_HOST: string = '0.0.0.0';

	@IsNumber()
	APP_PORT: number = 3000;
}

class LoggerEnvironment {
	@IsString()
	LOG_DIR: string = 'logs';

	@IsString()
	LOG_MAX_SIZE: string = '1m';

	@IsString()
	LOG_MAX_FILES: string = '2d';
}

class DatabaseEnvironment {
	@IsString()
	DATABASE_URL: string =
		'postgresql://@localhost:5432/nest_template_db?schema=public';

	@IsNumber()
	MAX_CONNECTION: number = 20;

	@IsNumber()
	IDLE_TIMEOUT_MILLIS: number = 30000;

	@IsNumber()
	CONNECTION_TIMEOUT_MILLIS: number = 2000;
}

class RedisEnvironment {
	@IsString()
	REDIS_HOST: string = 'localhost';

	@IsNumber()
	REDIS_PORT: number = 6379;

	@IsString()
	REDIS_PASSWORD: string = '';
}

class VnSkyPartnerEnvironment {
	@IsString()
	VNSKY_BASE_URL: string = 'http://localhost:8000';
}

export class EnvironmentVariables extends IntersectionType(
	AppEnvironment,
	LoggerEnvironment,
	DatabaseEnvironment,
	RedisEnvironment,
	VnSkyPartnerEnvironment,
) {}

export function validate(config: Record<string, unknown>) {
	const validatedConfig = plainToInstance(EnvironmentVariables, config, {
		enableImplicitConversion: true,
	});

	const errors = validateSync(validatedConfig, {
		skipMissingProperties: false,
	});

	if (errors.length > 0) {
		throw new Error(errors.toString());
	}

	return validatedConfig;
}
