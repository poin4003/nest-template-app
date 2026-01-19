import { PrismaService } from '@/core/database/prisma.service';
import { MyException } from '@/core/exception/my.exception';
import { ResultCode } from '@/core/response/result-code';
import { VnSkyService } from '@/modules/vn-sky/service/vn-sky.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { OrderStepEnum } from '../../order.enum';
import { OrderStepFailedEvent } from '../events/order-step-failed.event';
import { VnSkyOcrQuery } from '@/modules/vn-sky/service/schemas/vn-sky.query';
import { ExceptionFactory } from '@/core/exception/exception.factory';
import {
	VnSkyKit,
	VnSkyOcrReqCommand,
} from '@/modules/vn-sky/service/schemas/vn-sky.command';
import { getFileFromPath } from '@/common/utils/file.util';
import { OrderStepSuccessEvent } from '../events/order-step-success.event';

export class OcrCommand {
	constructor(public readonly orderId: string) {}
}

@CommandHandler(OcrCommand)
export class OcrHandler implements ICommandHandler<OcrCommand> {
	constructor(
		private readonly vnSkyService: VnSkyService,
		private readonly prisma: PrismaService,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: OcrCommand) {
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

			const ocr_query = new VnSkyOcrQuery();
			ocr_query.cardType = '1';

			const ocr_cmd = new VnSkyOcrReqCommand();

			if (!profile.frontPath)
				throw ExceptionFactory.dataNotFound(`Missing card front`);
			ocr_cmd.cardFront = getFileFromPath(profile.frontPath);
			if (!profile.backPath)
				throw ExceptionFactory.dataNotFound(`Missing card back`);
			ocr_cmd.cardBack = getFileFromPath(profile.backPath);
			if (!profile.portrait)
				throw ExceptionFactory.dataNotFound(`Missing card portrait`);
			ocr_cmd.portrait = getFileFromPath(profile.portrait);

			const dataKit = new VnSkyKit();
			dataKit.isdn = order.phoneNumber;
			dataKit.serial = order.serial;

			ocr_cmd.enableActiveMore3 = '0';
			ocr_cmd.data = dataKit;

			const result = await this.vnSkyService.vnSkyOcr(ocr_query, ocr_cmd);

			this.eventBus.publish(
				new OrderStepSuccessEvent(orderId, OrderStepEnum.OCR, result),
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
					OrderStepEnum.OCR,
					errorMessage,
					errorCode,
				),
			);
		}
	}
}
