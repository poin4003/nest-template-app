import { AppConfigService } from '@/config/settings/app-config.service';
import {
	Injectable,
	OnModuleInit,
	OnModuleDestroy,
	Logger,
} from '@nestjs/common';
import Redis from 'ioredis';

const REDIS_CONNECT_TIMEOUT = 10000;

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
	private client: Redis | null = null;
	private connectionTimeout: NodeJS.Timeout;
	private readonly logger = new Logger(RedisService.name);

	private readonly statusConnectRedis = {
		CONNECT: 'connect',
		END: 'end',
		RECONNECT: 'reconnecting',
		ERROR: 'error',
	};

	constructor(private readonly config: AppConfigService) {}

	async onModuleInit() {
		await this.initIORedis();
	}

	async onModuleDestroy() {
		await this.closeIORedis();
	}

	private async initIORedis() {
		const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = this.config;

		this.client = new Redis({
			host: REDIS_HOST,
			port: REDIS_PORT,
			password: REDIS_PASSWORD,
		});

		this.handleEventConnection(this.client);
	}

	public getClient(): Redis {
		if (!this.client) {
			throw new Error('Redis client not initialized');
		}
		return this.client;
	}

	private async closeIORedis() {
		if (this.client) {
			await this.client.quit();
			this.client = null;
			this.logger.log('Redis connection closed');
		}
	}

	private handleEventConnection(connectionRedis: Redis) {
		connectionRedis.on(this.statusConnectRedis.CONNECT, () => {
			this.logger.log(`Connection status: connected`);
			clearTimeout(this.connectionTimeout);
		});

		connectionRedis.on(this.statusConnectRedis.END, () => {
			this.logger.warn(`Connection status: disconnected`);
			this.handleTimeoutError();
		});

		connectionRedis.on(this.statusConnectRedis.RECONNECT, () => {
			this.logger.log(`Connection status: reconnecting`);
			clearTimeout(this.connectionTimeout);
		});

		connectionRedis.on(this.statusConnectRedis.ERROR, (err) => {
			this.logger.error(`Connection status: error ${err}`);
			this.handleTimeoutError();
		});
	}

	private handleTimeoutError() {
		if (this.connectionTimeout) clearTimeout(this.connectionTimeout);

		this.connectionTimeout = setTimeout(() => {
			this.logger.error('Redis connection timeout: Service connect error');
		}, REDIS_CONNECT_TIMEOUT);
	}
}
