import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { VnSkyService } from '@/modules/vn-sky/service/vn-sky.service';
import { PrismaService } from '@/core/database/prisma.service';
import { VnSkyCheckSimQuery } from '@/modules/vn-sky/service/schemas/vn-sky.query';
import { ExceptionFactory } from '@/core/exception/exception.factory';
import { OrderStepEnum } from '../../order.enum';
import { ResultCode } from '@/core/response/result-code';
import { OrderStepSuccessEvent } from '../events/order-step-success.event';
import { MyException } from '@/core/exception/my.exception';
import { OrderStepFailedEvent } from '../events/order-step-failed.event';

export class CheckSimBeforeRegCommand {
	constructor(public readonly orderId: string) {}
}

@CommandHandler(CheckSimBeforeRegCommand)
export class CheckSimBeforeRegHandler implements ICommandHandler<CheckSimBeforeRegCommand> {
	constructor(
		private readonly vnSkyService: VnSkyService,
		private readonly prisma: PrismaService,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: CheckSimBeforeRegCommand) {
		const { orderId } = command;

		try {
			const order = await this.prisma.order.findUnique({
				where: { id: orderId },
			});

			if (!order) throw ExceptionFactory.dataNotFound(`order: ${orderId}`);

			const query = new VnSkyCheckSimQuery();
			query.isdn = order.phoneNumber;
			query.serial = order.serial;

			const result = await this.vnSkyService.vnSkyCheckSim(query);
			await this.prisma.order.update({
				where: { id: orderId },
				data: {
					step: OrderStepEnum.CHECK_SIM_BEFORE_REG,
					note: 'Check sim success!',
				},
			});

			this.eventBus.publish(
				new OrderStepSuccessEvent(
					orderId,
					OrderStepEnum.CHECK_SIM_BEFORE_REG,
					result,
				),
			);
		} catch (error) {
			let errorCode: number = ResultCode.ERROR.code;
			let errorMessage = error.message;

			if (error instanceof MyException) {
				errorCode = error.resultCode.code;
				errorMessage = error.myMessage;
			}

			this.eventBus.publish(
				new OrderStepFailedEvent(
					orderId,
					OrderStepEnum.CHECK_SIM_BEFORE_REG,
					errorMessage,
					errorCode,
				),
			);
		}
	}
}
