import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './env.validation';

@Injectable()
export class AppConfigService {
	constructor(private configService: ConfigService<EnvironmentVariables>) {
		this.bindProperties();
	}

	private bindProperties() {
		const dummy = new EnvironmentVariables();
		const keys = Object.keys(dummy);

		for (const key of keys) {
			this[key] = this.configService.get(key as any, { infer: true });
		}
	}
}

export interface AppConfigService extends EnvironmentVariables {}
