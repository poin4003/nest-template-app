import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@/core/database/prisma.service';
import { OrderStatusEnum, OrderStepEnum } from '../../order.enum';
import { OrderStartedEvent } from '../events/order-started.event';
import { ExceptionFactory } from '@/core/exception/exception.factory';

export class StartOrderCommand {
	constructor(
		public readonly phoneNumber: string,
		public readonly serial: string,
		public readonly cardFrontPath: string,
		public readonly cardBackPath: string,
		public readonly portraitPath: string,
	) {}
}

@CommandHandler(StartOrderCommand)
export class StartOrderHandler implements ICommandHandler<StartOrderCommand> {
	constructor(
		private readonly prisma: PrismaService,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: StartOrderCommand) {
		const { phoneNumber, serial, cardFrontPath, cardBackPath, portraitPath } =
			command;

		const orderExist = await this.prisma.order.findFirst({
			where: { phoneNumber: phoneNumber, status: OrderStatusEnum.SUCCESS },
		});

		if (!orderExist)
			throw ExceptionFactory.dataAlreadyExists(
				`Sim are already reg or exists: ${phoneNumber}`,
			);

		const order = await this.prisma.order.create({
			data: {
				phoneNumber,
				serial,
				code: `ORD-${Date.now()}`,
				step: OrderStepEnum.START,
				status: OrderStatusEnum.INIT,
				profiles: {
					create: {
						frontPath: cardFrontPath,
						backPath: cardBackPath,
						portrait: portraitPath,
					},
				},
			},
		});

		this.eventBus.publish(new OrderStartedEvent(order.id));

		return order;
	}
}
