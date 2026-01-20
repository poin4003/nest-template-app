import { PrismaService } from '@/core/database/prisma.service';
import { MyException } from '@/core/exception/my.exception';
import { ResultCode } from '@/core/response/result-code';
import { VnSkyService } from '@/modules/vn-sky/service/vn-sky.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { OrderStepFailedEvent } from '../events/order-step-failed.event';
import { OrderStepEnum } from '../../order.enum';
import { ExceptionFactory } from '@/core/exception/exception.factory';
import { VnSkyGenCustomerCodeQuery } from '@/modules/vn-sky/service/schemas/vn-sky.query';
import { VnSkyProfileDataRaw } from '../../types/vnsky-profile-data-raw.type';
import { VnSkyOrderDataRaw } from '../../types/vnsky-order-data-raw.type';
import { OrderStepSuccessEvent } from '../events/order-step-success.event';

export class GenCustomerCodeCommand {
	constructor(public readonly orderId: string) {}
}

@CommandHandler(GenCustomerCodeCommand)
export class GenCustomerCodeHandler implements ICommandHandler<GenCustomerCodeCommand> {
	constructor(
		private readonly vnSkyService: VnSkyService,
		private readonly prisma: PrismaService,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: GenCustomerCodeCommand) {
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

			const genCCQuery = new VnSkyGenCustomerCodeQuery();
			genCCQuery.idNo = profileDataRaw.idNo;

			const result = await this.vnSkyService.vnSkyGenCustomerCode(genCCQuery);

			const existingData = (order?.rawData as any) || {};
			const orderData = new VnSkyOrderDataRaw({
				...existingData,
				customerCode: result.customerCode,
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
					OrderStepEnum.GENERATE_CUSTOMER_CODE,
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
					OrderStepEnum.GENERATE_CUSTOMER_CODE,
					errorMessage,
					errorCode,
				),
			);
		}
	}
}
