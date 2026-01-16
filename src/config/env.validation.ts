import { plainToInstance, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
	Development = 'development',
	Production = 'production',
}

export class EnvironmentVariables {
	@IsEnum(Environment)
	NODE_ENV: Environment = Environment.Development;

	// App config
	@IsString()
	APP_HOST: string = '0.0.0.0';

	@IsNumber()
	APP_PORT: number = 3000;

	// Logger config
	@IsString()
	LOG_DIR: string = 'logs';

	@IsString()
	LOG_MAX_SIZE: string = '1m';

	@IsString()
	LOG_MAX_FILES: string = '2d';
}

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
