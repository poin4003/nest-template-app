import { PrismaService } from '@/core/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { ActionLogQuery } from '../service/schemas/action-log.query';
import { Prisma } from '@prisma/client';

@Injectable()
export class ActionLogRepository {
	constructor(private readonly prisma: PrismaService) {}

	private buildWhereClause(query: ActionLogQuery): Prisma.ActionLogWhereInput {
		const { objectId } = query;

		return {
			...(objectId && { objectId }),
		};
	}

	async getManyActionLogs(query: ActionLogQuery) {
		const { currentPage, pageSize } = query;
		const where = this.buildWhereClause(query);

		const [items, total] = await Promise.all([
			this.prisma.actionLog.findMany({
				where,
				skip: (currentPage - 1) * pageSize,
				take: pageSize,
				orderBy: { createdAt: 'desc' },
			}),
			this.prisma.actionLog.count({ where }),
		]);

		return { items, total };
	}

	async getAllActionLogs(query: ActionLogQuery) {
		const where = this.buildWhereClause(query);

		return this.prisma.actionLog.findMany({
			where,
			orderBy: { createdAt: 'desc' },
		});
	}
}
