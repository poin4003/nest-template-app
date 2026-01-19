import { CommonService } from '@/modules/common/service/common.service';
import { Injectable } from '@nestjs/common';
import {
	VnSkyCheckProfileCommand,
	VnSkyConfirmOtpCommand,
	VnSkyGenContractCommand,
	VnSkyGetOtpCommand,
	VnSkyOcrReqCommand,
} from './schemas/vn-sky.command';
import {
	FormDataApiRequest,
	JsonApiRequest,
	UrlEncodedApiRequest,
} from '@/modules/common/service/schemas/common.command';
import { AppConfigService } from '@/config/settings/app-config.service';
import { ActionLogTypeEnum } from '@/modules/action-logs/action-log.enum';
import {
	VnSkyCheckSimResult,
	VnSkyGenContractNumberResult,
	VnSkyGenContractResult,
	VnSkyGenCustomerCodeResult,
	VnSkyGenSecretKeyResult,
	VnSkyGetOtpResult,
	VnSkyOrcResult,
	VnSkyProfileResult,
} from './schemas/vn-sky.result';
import { HTTPMethod } from '@/core/enums/http-method.enum';
import { ExceptionFactory } from '@/core/exception/exception.factory';
import {
	VnSkyCheckSimQuery,
	VnSkyGenContractNumberQuery,
	VnSkyGenCustomerCodeQuery,
	VnSkyGenSecretKeyQuery,
	VnSkyOcrQuery,
} from './schemas/vn-sky.query';
import { VnSkyAuthService } from './vn-sky-auth.service';

@Injectable()
export class VnSkyService {
	constructor(
		private readonly commonService: CommonService,
		private readonly settings: AppConfigService,
		private readonly vnSkyAuthService: VnSkyAuthService,
	) {}

	async vnSkyProfile() {
		return this.vnSkyAuthService.executeWithAuth(async (token) => {
			try {
				return this.commonService.callUrlEncodedApi(
					new UrlEncodedApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/admin-service/public/api/auth/profile`,
						method: HTTPMethod.GET,
						logType: ActionLogTypeEnum.VNSKY_PROFILE,
						headers: this.vnSkyAuthService.getVnSkyHeader(token),
						responseModel: VnSkyProfileResult,
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyProfileError('Error profile');
			}
		});
	}

	async vnSkyCheckSim(query: VnSkyCheckSimQuery) {
		return this.vnSkyAuthService.executeWithAuth(async (token) => {
			try {
				return this.commonService.callUrlEncodedApi(
					new UrlEncodedApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/customer-service/public/api/v1/check-sim-active-status`,
						method: HTTPMethod.GET,
						logType: ActionLogTypeEnum.VNSKY_CHECK_SIM,
						queryParams: { ...query },
						headers: this.vnSkyAuthService.getVnSkyHeader(token),
						responseModel: VnSkyCheckSimResult,
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyProfileError('Error profile');
			}
		});
	}

	async vnSkyOcr(query: VnSkyOcrQuery, cmd: VnSkyOcrReqCommand) {
		return this.vnSkyAuthService.executeWithAuth(async (token) => {
			const { cardFront, cardBack, portrait, ...ortherFields } = cmd;

			try {
				return this.commonService.callMixedFormDataApi(
					new FormDataApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/customer-service/public/api/v1/ocr-active`,
						logType: ActionLogTypeEnum.VNSKY_OCR,
						queryParams: { ...query },
						payload: {
							...ortherFields,
							data: JSON.stringify(ortherFields.data),
						},
						files: {
							cardFront,
							cardBack,
							portrait,
						},
						headers: this.vnSkyAuthService.getVnSkyHeader(token),
						responseModel: VnSkyOrcResult,
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyOcrError('');
			}
		});
	}

	async vnSkyGenCustomerCode(query: VnSkyGenCustomerCodeQuery) {
		return this.vnSkyAuthService.executeWithAuth(async (token) => {
			try {
				return this.commonService.callUrlEncodedApi(
					new UrlEncodedApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/customer-service/public/api/v1/gen-customer-code`,
						logType: ActionLogTypeEnum.VNSKY_GEN_CUSTOMER_CODE,
						queryParams: { ...query },
						headers: this.vnSkyAuthService.getVnSkyHeader(token),
						responseModel: VnSkyGenCustomerCodeResult,
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyGenCustomerCodeError('');
			}
		});
	}

	async vnSkyGenSecretKey(query: VnSkyGenSecretKeyQuery) {
		return this.vnSkyAuthService.executeWithAuth(async (token) => {
			try {
				return this.commonService.callUrlEncodedApi(
					new UrlEncodedApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/customer-service/public/api/v1/gen-secret-key`,
						method: HTTPMethod.GET,
						logType: ActionLogTypeEnum.VNSKY_GEN_SECRET_KEY,
						queryParams: { ...query },
						headers: this.vnSkyAuthService.getVnSkyHeader(token),
						responseModel: VnSkyGenSecretKeyResult,
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyGenSecretKeyError('');
			}
		});
	}

	async vnSkyCheckProfile(cmd: VnSkyCheckProfileCommand) {
		return this.vnSkyAuthService.executeWithAuth(async (token) => {
			try {
				return this.commonService.callApi(
					new JsonApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/customer-service/public/api/v1/check-8-condition-and-c06`,
						logType: ActionLogTypeEnum.VNSKY_CHECK_PROFILE,
						payload: cmd,
						headers: this.vnSkyAuthService.getVnSkyHeader(token),
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyCheckProfileError('');
			}
		});
	}

	async vnSkyGenContractNumber(query: VnSkyGenContractNumberQuery) {
		return this.vnSkyAuthService.executeWithAuth(async (token) => {
			try {
				return this.commonService.callUrlEncodedApi(
					new UrlEncodedApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/customer-service/public/api/v1/gen-contract-no`,
						logType: ActionLogTypeEnum.VNSKY_GEN_CONTRACT_NUMBER,
						queryParams: { ...query },
						headers: this.vnSkyAuthService.getVnSkyHeader(token),
						responseModel: VnSkyGenContractNumberResult,
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyGenContractNumberError('');
			}
		});
	}

	async vnSkyGenContract(cmd: VnSkyGenContractCommand) {
		return this.vnSkyAuthService.executeWithAuth(async (token) => {
			try {
				return this.commonService.callApi(
					new JsonApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/customer-service/public/api/v1/gen-contract`,
						logType: ActionLogTypeEnum.VNSKY_GEN_CONTRACT,
						payload: cmd,
						headers: this.vnSkyAuthService.getVnSkyHeader(token),
						responseModel: VnSkyGenContractResult,
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyGenContractError('');
			}
		});
	}

	async vnSkyGetOtp(cmd: VnSkyGetOtpCommand) {
		return this.vnSkyAuthService.executeWithAuth(async (token) => {
			try {
				return this.commonService.callApi(
					new JsonApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/customer-service/public/api/v1/get-otp`,
						logType: ActionLogTypeEnum.VNSKY_GET_OTP,
						payload: cmd,
						headers: this.vnSkyAuthService.getVnSkyHeader(token),
						responseModel: VnSkyGetOtpResult,
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyGetOtpError('');
			}
		});
	}

	async vnSkyConfirmOtp(cmd: VnSkyConfirmOtpCommand) {
		return this.vnSkyAuthService.executeWithAuth(async (token) => {
			try {
				return this.commonService.callApi(
					new JsonApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/customer-service/public/api/v1/confirm-otp`,
						logType: ActionLogTypeEnum.VNSKY_CONFIRM_OTP,
						payload: cmd,
						headers: this.vnSkyAuthService.getVnSkyHeader(token),
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyConfirmOtpError('');
			}
		});
	}
}
