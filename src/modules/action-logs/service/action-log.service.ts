import { PrismaService } from '@/core/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateActionLogCommand } from './schemas/action-log.command';
import { ActionLogResult } from './schemas/action-log.result';
import { plainToInstance } from 'class-transformer';
import { ActionLogQuery } from './schemas/action-log.query';
import { ActionLogRepository } from '../repository/action-log.repository';

@Injectable()
export class ActionLogService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly actionLogRepo: ActionLogRepository,
	) {}

	async createActionLog(cmd: CreateActionLogCommand): Promise<ActionLogResult> {
		const actionLog = await this.prisma.actionLog.create({
			data: {
				payload: cmd.payload,
				objectId: cmd.objectId,
				response: cmd.response,
				reqAt: cmd.reqAt,
				reqDuration: cmd.reqDuration,
				status: cmd.status,
				type: cmd.type,
				description: cmd.description,
				note: cmd.note,
			},
		});

		return plainToInstance(ActionLogResult, actionLog);
	}

	async getManyActionLog(query: ActionLogQuery) {
		const { items, total } = await this.actionLogRepo.getManyActionLogs(query);

		const mappedItems = plainToInstance(ActionLogResult, items);

		return {
			items: mappedItems,
			total: total,
		};
	}

	async getAllActionLog(query: ActionLogQuery): Promise<ActionLogResult[]> {
		const actionLogs = await this.actionLogRepo.getAllActionLogs(query);

		return plainToInstance(ActionLogResult, actionLogs);
	}
}
