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
import { VnSkyProfileDataRaw } from '../../types/vnsky-profile-data-raw.type';

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

			const ocrQuery = new VnSkyOcrQuery();
			ocrQuery.cardType = '1';

			const ocrCmd = new VnSkyOcrReqCommand();

			if (!profile.frontPath)
				throw ExceptionFactory.dataNotFound(`Missing card front`);
			ocrCmd.cardFront = getFileFromPath(profile.frontPath);
			if (!profile.backPath)
				throw ExceptionFactory.dataNotFound(`Missing card back`);
			ocrCmd.cardBack = getFileFromPath(profile.backPath);
			if (!profile.portrait)
				throw ExceptionFactory.dataNotFound(`Missing card portrait`);
			ocrCmd.portrait = getFileFromPath(profile.portrait);

			const dataKit = new VnSkyKit();
			dataKit.isdn = order.phoneNumber;
			dataKit.serial = order.serial;

			ocrCmd.enableActiveMore3 = '0';
			ocrCmd.data = dataKit;

			const result = await this.vnSkyService.vnSkyOcr(ocrQuery, ocrCmd);
			const profileData = new VnSkyProfileDataRaw({
				idNo: result.id,
				address: result.address,
				birthday: result.birthday,
				name: result.name,
				idEkyc: result.idEkyc,
				issueBy: result.issueBy,
				issueDate: result.issueDate,
				sex: result.sex,
				document: result.document,
				nationality: result.nationality,
				city: result.city,
				district: result.district,
				ward: result.ward,
				listPhoneNumber: result.listPhoneNumber,
				totalSim: result.totalSim,
				checkSendOtp: result.checkSendOtp,
			});

      await this.prisma.profile.update({
        where: { orderId: orderId },
        data: {
          name: profileData.name,
          rawData: profileData as any,
        }
      })

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
