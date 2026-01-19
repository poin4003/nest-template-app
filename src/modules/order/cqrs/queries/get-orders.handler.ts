import { plainToInstance } from 'class-transformer';
import { OrderRepository } from '../../repository/order.repository';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { OrderResult } from '../schemas/order.result';

export class GetOrdersQuery {
	constructor(
		public readonly currentPage: number = 1,
		public readonly pageSize: number = 10,
	) {}
}

@QueryHandler(GetOrdersQuery)
export class GetOrdersHandler implements IQueryHandler<GetOrdersQuery> {
	constructor(private readonly orderRepo: OrderRepository) {}

	async execute(query: GetOrdersQuery) {
		const { items, total } = await this.orderRepo.getManyOrders(query);

		const mappedItems = plainToInstance(OrderResult, items);

		return {
			items: mappedItems,
			total: total,
		};
	}
}
