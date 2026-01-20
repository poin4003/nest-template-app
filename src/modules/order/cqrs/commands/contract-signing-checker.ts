import { PrismaService } from '@/core/database/prisma.service';
import { ExceptionFactory } from '@/core/exception/exception.factory';
import { VnSkyService } from '@/modules/vn-sky/service/vn-sky.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { VnSkyOrderDataRaw } from '../../types/vnsky-order-data-raw.type';
import { VnSkyContractSigningCheckerCommand } from '@/modules/vn-sky/service/schemas/vn-sky.command';
import { OrderStepSuccessEvent } from '../events/order-step-success.event';
import { OrderStepEnum } from '../../order.enum';
import { ResultCode } from '@/core/response/result-code';
import { MyException } from '@/core/exception/my.exception';
import { OrderStepFailedEvent } from '../events/order-step-failed.event';

export class ContractSigningCheckerCommand {
	constructor(public readonly orderId: string) {}
}

@CommandHandler(ContractSigningCheckerCommand)
export class ContractSigningCheckerHandler implements ICommandHandler<ContractSigningCheckerCommand> {
	constructor(
		private readonly vnSkyService: VnSkyService,
		private readonly prisma: PrismaService,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: ContractSigningCheckerCommand) {
		const { orderId } = command;

		try {
			const order = await this.prisma.order.findUnique({
				where: { id: orderId },
			});

			if (!order) throw ExceptionFactory.dataNotFound(`order: ${orderId}`);

			const orderDataRaw = new VnSkyOrderDataRaw(order?.rawData as any);

			const CSCCmd = new VnSkyContractSigningCheckerCommand();
			CSCCmd.id = orderDataRaw.contractId;

			const result =
				await this.vnSkyService.vnSkyContractSigningChecker(CSCCmd);

			this.eventBus.publish(
				new OrderStepSuccessEvent(
					orderId,
					OrderStepEnum.CONTRACT_SIGNING_CHECKER,
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
					OrderStepEnum.CONTRACT_SIGNING_CHECKER,
					errorMessage,
					errorCode,
				),
			);
		}
	}
}
