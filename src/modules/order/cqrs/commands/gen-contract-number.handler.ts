import { PrismaService } from '@/core/database/prisma.service';
import { VnSkyService } from '@/modules/vn-sky/service/vn-sky.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { OrderStepFailedEvent } from '../events/order-step-failed.event';
import { OrderStepEnum } from '../../order.enum';
import { MyException } from '@/core/exception/my.exception';
import { ResultCode } from '@/core/response/result-code';
import { OrderStepSuccessEvent } from '../events/order-step-success.event';
import { VnSkyOrderDataRaw } from '../../types/vnsky-order-data-raw.type';
import { ExceptionFactory } from '@/core/exception/exception.factory';
import { VnSkyProfileDataRaw } from '../../types/vnsky-profile-data-raw.type';
import { VnSkyGenContractNumberQuery } from '@/modules/vn-sky/service/schemas/vn-sky.query';

export class GenContractNumberCommand {
	constructor(public readonly orderId: string) {}
}

@CommandHandler(GenContractNumberCommand)
export class GenContractNumberHandler implements ICommandHandler<GenContractNumberCommand> {
	constructor(
		private readonly vnSkyService: VnSkyService,
		private readonly prisma: PrismaService,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: GenContractNumberCommand) {
		const { orderId } = command;

		try {
			const order = await this.prisma.order.findUnique({
				where: { id: orderId },
				include: {
					profiles: true,
				},
			});

			if (!order) throw ExceptionFactory.dataNotFound(`order: ${orderId}`);
			const profile = order.profiles;
			if (!profile) throw ExceptionFactory.dataNotFound(`profile: ${orderId}`);
			const profileDataRaw = new VnSkyProfileDataRaw(profile?.rawData as any);

			const genCNQuery = new VnSkyGenContractNumberQuery();
			genCNQuery.idNo = profileDataRaw.idNo;
			genCNQuery.activeType = '1';

			const result = await this.vnSkyService.vnSkyGenContractNumber(genCNQuery);

			const existingData = (order?.rawData as any) || {};
			const orderData = new VnSkyOrderDataRaw({
				...existingData,
				contractNo: result.contractNo,
			});

			await this.prisma.order.update({
				where: { id: orderId },
				data: {
					rawData: orderData as any,
				},
			});

			this.eventBus.publish(
				new OrderStepSuccessEvent(
					orderId,
					OrderStepEnum.GENERATE_CONTRACT_NUMBER,
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
					OrderStepEnum.GENERATE_CONTRACT_NUMBER,
					errorMessage,
					errorCode,
				),
			);
		}
	}
}
