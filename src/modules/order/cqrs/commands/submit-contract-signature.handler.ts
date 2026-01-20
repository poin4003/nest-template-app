import { PrismaService } from '@/core/database/prisma.service';
import { ExceptionFactory } from '@/core/exception/exception.factory';
import { VnSkyService } from '@/modules/vn-sky/service/vn-sky.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { OrderStepSuccessEvent } from '../events/order-step-success.event';
import { OrderStepEnum } from '../../order.enum';
import { ResultCode } from '@/core/response/result-code';
import { MyException } from '@/core/exception/my.exception';
import { OrderStepFailedEvent } from '../events/order-step-failed.event';
import { VnSkySubmitContractSignatureCommand } from '@/modules/vn-sky/service/schemas/vn-sky.command';
import { VnSkyOrderDataRaw } from '../../types/vnsky-order-data-raw.type';
import { getImageFromAsset } from '@/common/utils/file.util';
import { AppConfigService } from '@/config/settings/app-config.service';

export class SubmitContractSignatureCommand {
	constructor(public readonly orderId: string) {}
}

@CommandHandler(SubmitContractSignatureCommand)
export class SubmitContractSignatureHandler implements ICommandHandler<SubmitContractSignatureCommand> {
	constructor(
		private readonly vnSkyService: VnSkyService,
		private readonly prisma: PrismaService,
		private readonly eventBus: EventBus,  
		private readonly settings: AppConfigService,
	) {}

	async execute(command: SubmitContractSignatureCommand) {
		const { orderId } = command;

		try {
			const order = await this.prisma.order.findUnique({
				where: { id: orderId },
			});

			if (!order) throw ExceptionFactory.dataNotFound(`order: ${orderId}`);
			const orderDataRaw = new VnSkyOrderDataRaw(order?.rawData as any);

			const submitCSCmd = new VnSkySubmitContractSignatureCommand();
			submitCSCmd.contractNo = orderDataRaw.contractNo;
			submitCSCmd.signature = getImageFromAsset(this.settings.VNSKY_SIGN_IMAGE_NAME);

			const result =
				await this.vnSkyService.vnSkySubmitContractSignature(submitCSCmd);

			this.eventBus.publish(
				new OrderStepSuccessEvent(
					orderId,
					OrderStepEnum.SUBMIT_CONTRACT_SIGNATURE,
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
					OrderStepEnum.SUBMIT_CONTRACT_SIGNATURE,
					errorMessage,
					errorCode,
				),
			);
		}
	}
}
