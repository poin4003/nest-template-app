import { AppConfigService } from '@/config/settings/app-config.service';
import { PrismaService } from '@/core/database/prisma.service';
import { ExceptionFactory } from '@/core/exception/exception.factory';
import { VnSkyService } from '@/modules/vn-sky/service/vn-sky.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { VnSkyProfileDataRaw } from '../../types/vnsky-profile-data-raw.type';
import { VnSkyOrderDataRaw } from '../../types/vnsky-order-data-raw.type';
import { OrderStepSuccessEvent } from '../events/order-step-success.event';
import { OrderStepEnum } from '../../order.enum';
import { ResultCode } from '@/core/response/result-code';
import { MyException } from '@/core/exception/my.exception';
import { OrderStepFailedEvent } from '../events/order-step-failed.event';
import { VnSkyGenContractCommand, VnSkyPhoneObject } from '@/modules/vn-sky/service/schemas/vn-sky.command';
import dayjs from 'dayjs';

export class GenContractCommand {
	constructor(public readonly orderId: string) {}
}

@CommandHandler(GenContractCommand)
export class GenContractHandler implements ICommandHandler<GenContractCommand> {
	constructor(
		private readonly vnSkyService: VnSkyService,
		private readonly prisma: PrismaService,
		private readonly eventBus: EventBus,
		private readonly settings: AppConfigService,
	) {}

	async execute(command: GenContractCommand) {
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

      const simObject = new VnSkyPhoneObject();
      simObject.phoneNumber = order.phoneNumber;
      simObject.serialSim = order.serial;
      simObject.packagePlan = orderDataRaw.pckCode;

			const genContractCmd = new VnSkyGenContractCommand();
			genContractCmd.codeDecree13 = this.settings.VNSKY_CODE_DECREE_13;
			genContractCmd.contractNo = orderDataRaw.contractNo;
			genContractCmd.customerId = orderDataRaw.customerCode;
			genContractCmd.ccdvvt = this.settings.VNSKY_CCDVVT;
			genContractCmd.contractDate = dayjs().format('DD/MM/YYYY');
			genContractCmd.customerName = profileDataRaw.name;
			genContractCmd.gender = profileDataRaw.sex;
			genContractCmd.birthDate = profileDataRaw.birthday;
			genContractCmd.idNo = profileDataRaw.idNo;
			genContractCmd.idDate = profileDataRaw.issueDate;
			genContractCmd.idPlace = profileDataRaw.issueBy;
			genContractCmd.address = profileDataRaw.address;
			genContractCmd.type = this.settings.VNSKY_CONTRACT_TYPE;
			genContractCmd.phoneLists = [simObject];
			genContractCmd.deviceToken = this.settings.VNSKY_DEVICE_TOKEN;

			const result = await this.vnSkyService.vnSkyGenContract(genContractCmd);

			const existingData = (order?.rawData as any) || {};
			const orderData = new VnSkyOrderDataRaw({
				...existingData,
				contractId: result.contractId,
				contractPNGImagePath: result.contractPNGImagePath,
				type: result.type,
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
					OrderStepEnum.GENERATE_CONTRACT,
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
					OrderStepEnum.GENERATE_CONTRACT,
					errorMessage,
					errorCode,
				),
			);
		}
	}
}
