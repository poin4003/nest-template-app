import { PrismaService } from '@/core/database/prisma.service';
import { ExceptionFactory } from '@/core/exception/exception.factory';
import { VnSkyService } from '@/modules/vn-sky/service/vn-sky.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { OrderStepFailedEvent } from '../events/order-step-failed.event';
import { OrderStepEnum } from '../../order.enum';
import { MyException } from '@/core/exception/my.exception';
import { ResultCode } from '@/core/response/result-code';
import { OrderStepSuccessEvent } from '../events/order-step-success.event';
import { VnSkyConfirmOtpCommand } from '@/modules/vn-sky/service/schemas/vn-sky.command';
import { VnSkyOrderDataRaw } from '../../types/vnsky-order-data-raw.type';
import { VnSkyProfileDataRaw } from '../../types/vnsky-profile-data-raw.type';
import { AppConfigService } from '@/config/settings/app-config.service';

export class ConfirmOtpCommand {
	constructor(public readonly orderId: string) {}
}

@CommandHandler(ConfirmOtpCommand)
export class ConfitmOtpHandler implements ICommandHandler<ConfirmOtpCommand> {
	constructor(
		private readonly vnSkyService: VnSkyService,
		private readonly prisma: PrismaService,
		private readonly eventBus: EventBus,
		private readonly settings: AppConfigService,
	) {}

	async execute(command: ConfirmOtpCommand) {
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
			const orderDataRaw = new VnSkyOrderDataRaw(order?.rawData as any);

			const confirmOtpCmd = new VnSkyConfirmOtpCommand();
			confirmOtpCmd.id = orderDataRaw.id;
			confirmOtpCmd.idEkyc = profileDataRaw.idEkyc;
			confirmOtpCmd.isdn = order.phoneNumber;
			confirmOtpCmd.transactionId = orderDataRaw.transactionId;
			confirmOtpCmd.otp = this.settings.VNSKY_DEFAULT_OTP;

			const result = await this.vnSkyService.vnSkyConfirmOtp(confirmOtpCmd);

			this.eventBus.publish(
				new OrderStepSuccessEvent(orderId, OrderStepEnum.CONFIRM_OTP, result),
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
					OrderStepEnum.CONFIRM_OTP,
					errorMessage,
					errorCode,
				),
			);
		}
	}
}
