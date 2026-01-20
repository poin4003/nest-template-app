import { IntersectionType } from '@nestjs/mapped-types';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
	IsArray,
	IsEnum,
	IsNumber,
	IsString,
	validateSync,
} from 'class-validator';

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

	@IsString()
	VNSKY_AUTHENTICATION_BASIC_CODE: string = '';

	@IsString()
	VNSKY_CLIENT_IDENTITY: string = '';

	@IsString()
	VNSKY_USERNAME: string = '';

	@IsString()
	VNSKY_PASSWORD: string = '';

	@IsString()
	VNSKY_DEFAULT_OTP: string = '';

	@IsArray()
	@IsString({ each: true })
	@Transform(({ value }) => value?.split(',').map((v) => v.trim()))
	VNSKY_CODE_DECREE_13: string[] = [];

	@IsString()
	VNSKY_CCDVVT: string = '';

	@IsString()
	VNSKY_CONTRACT_TYPE: string = 'PNG';

	@IsString()
	VNSKY_DEVICE_TOKEN: string = '';

	@IsString()
	VNSKY_ORIGIN: string = '';

  @IsString()
  VNSKY_SIGN_IMAGE_NAME: string = 'sign.jpg';
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
