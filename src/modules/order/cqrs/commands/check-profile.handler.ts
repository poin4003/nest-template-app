import { PrismaService } from "@/core/database/prisma.service";
import { MyException } from "@/core/exception/my.exception";
import { ResultCode } from "@/core/response/result-code";
import { VnSkyService } from "@/modules/vn-sky/service/vn-sky.service";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { OrderStepFailedEvent } from "../events/order-step-failed.event";
import { OrderStepEnum } from "../../order.enum";
import { OrderStepSuccessEvent } from "../events/order-step-success.event";
import { ExceptionFactory } from "@/core/exception/exception.factory";
import { VnSkyProfileDataRaw } from "../../types/vnsky-profile-data-raw.type";
import { VnSkyCheckProfileCommand } from "@/modules/vn-sky/service/schemas/vn-sky.command";
import { convertDMYToYMD } from "@/common/utils/datetime.util";

export class CheckProfileCommand {
	constructor(public readonly orderId: string) {}
}

@CommandHandler(CheckProfileCommand)
export class CheckProfileHandler implements ICommandHandler<CheckProfileCommand> {
	constructor(
		private readonly vnSkyService: VnSkyService,
		private readonly prisma: PrismaService,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: CheckProfileCommand) {
		const { orderId } = command;

		try {
			const profile = await this.prisma.profile.findUnique({
				where: { orderId: orderId },
			});

			if (!profile) throw ExceptionFactory.dataNotFound(`profile with orderId: ${orderId}`);
			const profileDataRaw = new VnSkyProfileDataRaw(
				profile?.rawData as any,
			);

      const checkProfileCmd = new VnSkyCheckProfileCommand();
      checkProfileCmd.address = profileDataRaw.address;
      checkProfileCmd.birthday = convertDMYToYMD(profileDataRaw.birthday); 
      checkProfileCmd.city = profileDataRaw.city;
      checkProfileCmd.district = profileDataRaw.district;
      checkProfileCmd.ward = profileDataRaw.ward;
      checkProfileCmd.document = profileDataRaw.document;
      checkProfileCmd.expiry = convertDMYToYMD(profileDataRaw.expiry);
      checkProfileCmd.id = profileDataRaw.idNo;
      checkProfileCmd.idEkyc = profileDataRaw.idEkyc;
      checkProfileCmd.issueBy = profileDataRaw.issueBy;
      checkProfileCmd.issueDate = convertDMYToYMD(profileDataRaw.issueDate); 
      checkProfileCmd.name = profileDataRaw.name;
      checkProfileCmd.sex = profileDataRaw.sex;

			const result = await this.vnSkyService.vnSkyCheckProfile(checkProfileCmd);

			this.eventBus.publish(
				new OrderStepSuccessEvent(orderId, OrderStepEnum.CHECK_PROFILE, result),
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
					OrderStepEnum.CHECK_PROFILE,
					errorMessage,
					errorCode,
				),
			);
		}
	}
}

