import { PrismaService } from '@/core/database/prisma.service';
import { MyException } from '@/core/exception/my.exception';
import { ResultCode } from '@/core/response/result-code';
import { VnSkyService } from '@/modules/vn-sky/service/vn-sky.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { OrderStepFailedEvent } from '../events/order-step-failed.event';
import { OrderStepEnum } from '../../order.enum';
import { ExceptionFactory } from '@/core/exception/exception.factory';
import { VnSkyOrderDataRaw } from '../../types/vnsky-order-data-raw.type';
import { OrderStepSuccessEvent } from '../events/order-step-success.event';
import { VnSkyGenSecretKeyQuery } from '@/modules/vn-sky/service/schemas/vn-sky.query';
import { VnSkyProfileDataRaw } from '../../types/vnsky-profile-data-raw.type';

export class GenSecretKeyCommand {
	constructor(public readonly orderId: string) {}
}

@CommandHandler(GenSecretKeyCommand)
export class GenSecretKeyHandler implements ICommandHandler<GenSecretKeyCommand> {
	constructor(
		private readonly vnSkyService: VnSkyService,
		private readonly prisma: PrismaService,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: GenSecretKeyCommand) {
		const { orderId } = command;

		try {
			const profile = await this.prisma.profile.findUnique({
				where: { orderId: orderId },
			});

			if (!profile)
				throw ExceptionFactory.dataNotFound(`profile with orderId: ${orderId}`);
			const profileDataRaw = new VnSkyProfileDataRaw(profile?.rawData as any);

			const genSKQuery = new VnSkyGenSecretKeyQuery();
			genSKQuery.idKyc = profileDataRaw.idEkyc;

			const result = await this.vnSkyService.vnSkyGenSecretKey(genSKQuery);

			const orderData = new VnSkyOrderDataRaw({
				sessionToken: result.sessionToken,
				publicKey: result.publicKey,
				expiredAt: result.expiredAt,
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
					OrderStepEnum.GENERATE_SECRET_KEY,
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
					OrderStepEnum.GENERATE_SECRET_KEY,
					errorMessage,
					errorCode,
				),
			);
		}
	}
}
