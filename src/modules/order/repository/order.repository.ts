import { PrismaService } from '@/core/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { GetOrdersQuery } from '../cqrs/queries/get-orders.handler';

@Injectable()
export class OrderRepository {
	constructor(private readonly prisma: PrismaService) {}

	async getManyOrders(query: GetOrdersQuery) {
		const { currentPage, pageSize } = query;

		const [items, total] = await Promise.all([
			this.prisma.order.findMany({
				skip: (currentPage - 1) * pageSize,
				take: pageSize,
				orderBy: { createdAt: 'desc' },
			}),
			this.prisma.order.count(),
		]);

		return { items, total };
	}
}
