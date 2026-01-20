import { PrismaService } from '@/core/database/prisma.service';
import { ExceptionFactory } from '@/core/exception/exception.factory';
import { VnSkyService } from '@/modules/vn-sky/service/vn-sky.service';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { VnSkyProfileDataRaw } from '../../types/vnsky-profile-data-raw.type';
import { OrderStepSuccessEvent } from '../events/order-step-success.event';
import { OrderStepEnum } from '../../order.enum';
import { OrderStepFailedEvent } from '../events/order-step-failed.event';
import { MyException } from '@/core/exception/my.exception';
import { ResultCode } from '@/core/response/result-code';
import {
	VnSkyActivateCommand,
	VnSkyEcryptedData,
} from '@/modules/vn-sky/service/schemas/vn-sky.command';
import { getFileFromPath } from '@/common/utils/file.util';
import { VnSkyOrderDataRaw } from '../../types/vnsky-order-data-raw.type';
import * as forge from 'node-forge';
import { convertDMYToYMD } from '@/common/utils/datetime.util';
import dayjs from 'dayjs';
import { AppConfigService } from '@/config/settings/app-config.service';
import { createHash } from 'node:crypto';

export class ActivateCommand {
	constructor(public readonly orderId: string) {}
}

@CommandHandler(ActivateCommand)
export class ActivateHandler implements ICommandHandler<ActivateCommand> {
	constructor(
		private readonly vnSkyService: VnSkyService,
		private readonly prisma: PrismaService,
		private readonly eventBus: EventBus,
		private readonly settings: AppConfigService,
	) {}

	async execute(command: ActivateCommand) {
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

			const activateCmd = new VnSkyActivateCommand();

			if (!profile.frontPath)
				throw ExceptionFactory.dataNotFound(`Missing card front`);
			activateCmd.front = getFileFromPath(profile.frontPath);
			if (!profile.backPath)
				throw ExceptionFactory.dataNotFound(`Missing card back`);
			activateCmd.back = getFileFromPath(profile.backPath);
			if (!profile.portrait)
				throw ExceptionFactory.dataNotFound(`Missing card portrait`);
			activateCmd.portrait = getFileFromPath(profile.portrait);

			activateCmd.idEkyc = profileDataRaw.idEkyc;

			const payloadObj = {
				request: {
					strSex: profileDataRaw.sex,
					strSubName: profileDataRaw.name,
					strIdNo: profileDataRaw.idNo,
					strIdIssueDate: profileDataRaw.issueDate,
					strIdIssuePlace: profileDataRaw.issueBy,
					strBirthday: profileDataRaw.birthday,
					strProvince: profileDataRaw.city,
					strDistrict: profileDataRaw.district,
					strPrecinct: profileDataRaw.ward,
					strHome: profileDataRaw.address,
					strAddress: profileDataRaw.address,
					strContractNo: orderDataRaw.contractNo,
					strIsdn: order.phoneNumber,
					strSerial: order.serial,
				},
				idExpiryDate: convertDMYToYMD(profileDataRaw.expiry),
				idType: profileDataRaw.document,
				idEkyc: profileDataRaw.idEkyc,
				customerCode: orderDataRaw.contractId,
				contractDate: dayjs().format('DD/MM/YYYY'),
				decree13Accept: this.settings.VNSKY_CODE_DECREE_13,
				sessionToken: orderDataRaw.sessionToken,
				signature: createHash('md5')
					.update(profileDataRaw.idEkyc + orderDataRaw.sessionToken)
					.digest('hex'),
			};

			const { encryptedData, encryptedAESKey, iv } = this.encryptVnSky(
				payloadObj,
				orderDataRaw.publicKey,
			);
			const encryptData = new VnSkyEcryptedData();
			encryptData.encryptedData = encryptedData;
			encryptData.encryptedAESKey = encryptedAESKey;
			encryptData.iv = iv;

      activateCmd.data = encryptData;

			const result = await this.vnSkyService.vnSkyActivate(activateCmd);

			this.eventBus.publish(
				new OrderStepSuccessEvent(orderId, OrderStepEnum.ACTIVATE, result),
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
					OrderStepEnum.ACTIVATE,
					errorMessage,
					errorCode,
				),
			);
		}
	}

	private encryptVnSky(payload: object, publicKeyBase64: string) {
		const payloadStr = JSON.stringify(payload);

		const aesKey = forge.random.getBytesSync(32);
		const iv = forge.random.getBytesSync(12);

		const cipher = forge.cipher.createCipher('AES-GCM', aesKey);
		cipher.start({ iv: iv, tagLength: 128 });
		cipher.update(forge.util.createBuffer(payloadStr, 'utf8'));
		cipher.finish();

		const encryptedBytes = cipher.output.getBytes();
		const mode = cipher.mode as any;
		const tag = mode.tag.getBytes();

		const encryptedData = forge.util.encode64(encryptedBytes + tag);

		const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`;
		const publicKey = forge.pki.publicKeyFromPem(
			publicKeyPem,
		) as forge.pki.rsa.PublicKey;

		const encryptedAESKey = forge.util.encode64(
			publicKey.encrypt(aesKey, 'RSAES-PKCS1-V1_5'),
		);

		return {
			encryptedData,
			encryptedAESKey,
			iv: forge.util.encode64(iv),
		};
	}
}
