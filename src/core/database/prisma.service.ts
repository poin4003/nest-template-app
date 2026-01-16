import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { AppConfigService } from '@/config/settings/app-config.service';

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	constructor(private readonly settings: AppConfigService) {
		const pool = new Pool({
			connectionString: settings.DATABASE_URL,
			max: settings.MAX_CONNECTION,
			idleTimeoutMillis: settings.IDLE_TIMEOUT_MILLIS,
			connectionTimeoutMillis: settings.CONNECTION_TIMEOUT_MILLIS,
		});

		const adapter = new PrismaPg(pool);

		super({
			adapter,
			log: ['query', 'info', 'warn', 'error'],
		});
	}

	async onModuleInit() {
		await this.$connect();
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}
}
