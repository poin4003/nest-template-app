import { CommonService } from '@/modules/common/service/common.service';
import { Injectable } from '@nestjs/common';
import {
	VnSkyCheckProfileCommand,
	VnSkyConfirmOtpCommand,
	VnSkyGenContractCommand,
	VnSkyGetOtpCommand,
	VnSkyLoginReqCommand,
	VnSkyOcrReqCommand,
	VnSkyRefreshTokenReqCommand,
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
	VnSkyLoginResResult,
	VnSkyOrcResult,
	VnSkyProfileResult,
} from './schemas/vn-sky.result';
import { HTTPMethod } from '@/core/enums/http-method.enum';
import { RedisService } from '@/core/redis/redis.service';
import { MyLoggerService } from '@/common/logger/my-logger.service';
import { ExceptionFactory } from '@/core/exception/exception.factory';
import {
	VnSkyCheckSimQuery,
	VnSkyGenContractNumberQuery,
	VnSkyGenCustomerCodeQuery,
	VnSkyGenSecretKeyQuery,
	VnSkyOcrQuery,
} from './schemas/vn-sky.query';

const VNSKY_KEYS = {
	ACCESS_TOKEN: 'VNSKY:ACCESS_TOKEN',
	REFRESH_TOKEN: 'VNSKY:REFRESH_TOKEN',
	AUTH_LOCK: 'VNSKY:AUTH_LOCK',
};

@Injectable()
export class VnSkyService {
	constructor(
		private readonly commonService: CommonService,
		private readonly settings: AppConfigService,
		private readonly redis: RedisService,
		private readonly logger: MyLoggerService,
	) {}

	async vnSkyProfile() {
		return this.executeWithAuth(async (token) => {
			try {
				return this.commonService.callUrlEncodedApi(
					new UrlEncodedApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/admin-service/public/api/auth/profile`,
						method: HTTPMethod.GET,
						logType: ActionLogTypeEnum.VNSKY_PROFILE,
						headers: this.getVnSkyHeader(token),
						responseModel: VnSkyProfileResult,
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyProfileError('Error profile');
			}
		});
	}

	async vnSkyCheckSim(query: VnSkyCheckSimQuery) {
		return this.executeWithAuth(async (token) => {
			try {
				return this.commonService.callUrlEncodedApi(
					new UrlEncodedApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/customer-service/public/api/v1/check-sim-active-status`,
						method: HTTPMethod.GET,
						logType: ActionLogTypeEnum.VNSKY_CHECK_SIM,
						queryParams: { ...query },
						headers: this.getVnSkyHeader(token),
						responseModel: VnSkyCheckSimResult,
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyProfileError('Error profile');
			}
		});
	}

	async vnSkyOrc(query: VnSkyOcrQuery, cmd: VnSkyOcrReqCommand) {
		return this.executeWithAuth(async (token) => {
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
						headers: this.getVnSkyHeader(token),
						responseModel: VnSkyOrcResult,
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyOcrError('');
			}
		});
	}

	async vnSkyGenCustomerCode(query: VnSkyGenCustomerCodeQuery) {
		return this.executeWithAuth(async (token) => {
			try {
				return this.commonService.callUrlEncodedApi(
					new UrlEncodedApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/customer-service/public/api/v1/gen-customer-code`,
						logType: ActionLogTypeEnum.VNSKY_GEN_CUSTOMER_CODE,
						queryParams: { ...query },
						headers: this.getVnSkyHeader(token),
						responseModel: VnSkyGenCustomerCodeResult,
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyGenCustomerCodeError('');
			}
		});
	}

	async vnSkyGenSecretKey(query: VnSkyGenSecretKeyQuery) {
		return this.executeWithAuth(async (token) => {
			try {
				return this.commonService.callUrlEncodedApi(
					new UrlEncodedApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/customer-service/public/api/v1/gen-secret-key`,
						method: HTTPMethod.GET,
						logType: ActionLogTypeEnum.VNSKY_GEN_SECRET_KEY,
						queryParams: { ...query },
						headers: this.getVnSkyHeader(token),
						responseModel: VnSkyGenSecretKeyResult,
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyGenSecretKeyError('');
			}
		});
	}

	async vnSkyCheckProfile(cmd: VnSkyCheckProfileCommand) {
		return this.executeWithAuth(async (token) => {
			try {
				return this.commonService.callApi(
					new JsonApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/customer-service/public/api/v1/check-8-condition-and-c06`,
						logType: ActionLogTypeEnum.VNSKY_CHECK_PROFILE,
						payload: cmd,
						headers: this.getVnSkyHeader(token),
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyCheckProfileError('');
			}
		});
	}

	async vnSkyGenContractNumber(query: VnSkyGenContractNumberQuery) {
		return this.executeWithAuth(async (token) => {
			try {
				return this.commonService.callUrlEncodedApi(
					new UrlEncodedApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/customer-service/public/api/v1/gen-contract-no`,
						logType: ActionLogTypeEnum.VNSKY_GEN_CONTRACT_NUMBER,
						queryParams: { ...query },
						headers: this.getVnSkyHeader(token),
						responseModel: VnSkyGenContractNumberResult,
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyGenContractNumberError('');
			}
		});
	}

	async vnSkyGenContract(cmd: VnSkyGenContractCommand) {
		return this.executeWithAuth(async (token) => {
			try {
				return this.commonService.callApi(
					new JsonApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/customer-service/public/api/v1/gen-contract`,
						logType: ActionLogTypeEnum.VNSKY_GEN_CONTRACT,
						payload: cmd,
						headers: this.getVnSkyHeader(token),
						responseModel: VnSkyGenContractResult,
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyGenContractError('');
			}
		});
	}

	async vnSkyGetOtp(cmd: VnSkyGetOtpCommand) {
		return this.executeWithAuth(async (token) => {
			try {
				return this.commonService.callApi(
					new JsonApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/customer-service/public/api/v1/get-otp`,
						logType: ActionLogTypeEnum.VNSKY_GET_OTP,
						payload: cmd,
						headers: this.getVnSkyHeader(token),
						responseModel: VnSkyGetOtpResult,
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyGetOtpError('');
			}
		});
	}

	async vnSkyConfirmOtp(cmd: VnSkyConfirmOtpCommand) {
		return this.executeWithAuth(async (token) => {
			try {
				return this.commonService.callApi(
					new JsonApiRequest({
						url: `${this.settings.VNSKY_BASE_URL}/customer-service/public/api/v1/confirm-otp`,
						logType: ActionLogTypeEnum.VNSKY_CONFIRM_OTP,
						payload: cmd,
						headers: this.getVnSkyHeader(token),
					}),
				);
			} catch (error) {
				throw ExceptionFactory.vnSkyConfirmOtpError('');
			}
		});
	}

	private async vnSkyLogin(): Promise<VnSkyLoginResResult> {
		try {
			const cmd = new VnSkyLoginReqCommand();
			cmd.grantType = 'password';
			cmd.clientIdentity = this.settings.VNSKY_CLIENT_IDENTITY;
			cmd.username = this.settings.VNSKY_USERNAME;
			cmd.password = this.settings.VNSKY_PASSWORD;

			return this.commonService.callUrlEncodedApi(
				new UrlEncodedApiRequest({
					url: `${this.settings.VNSKY_BASE_URL}/admin-service/public/oauth2/token`,
					logType: ActionLogTypeEnum.VNSKY_LOGIN,
					payload: cmd,
					responseModel: VnSkyLoginResResult,
					headers: this.getVnSkyAuthHeader(),
				}),
			);
		} catch (error) {
			throw ExceptionFactory.vnSkyLoginError('Login vnsky error');
		}
	}

	private async vnSkyRefreshToken(
		refreshToken: string,
	): Promise<VnSkyLoginResResult> {
		try {
			const cmd = new VnSkyRefreshTokenReqCommand();
			cmd.grantType = 'refresh_token';
			cmd.refreshToken = refreshToken;

			return this.commonService.callUrlEncodedApi(
				new UrlEncodedApiRequest({
					url: `${this.settings.VNSKY_BASE_URL}/admin-service/public/oauth2/token`,
					logType: ActionLogTypeEnum.VNSKY_REFRESH_TOKEN,
					payload: cmd,
					responseModel: VnSkyLoginResResult,
					headers: this.getVnSkyAuthHeader(),
				}),
			);
		} catch (error) {
			throw ExceptionFactory.vnSkyRefreshTokenError(
				'Refresh token vnsky error',
			);
		}
	}

	async executeWithAuth<T>(apiCall: (token: string) => Promise<T>): Promise<T> {
		let token = await this.getValidToken();

		try {
			return await apiCall(token);
		} catch (error) {
			const status = error.status || error?.response?.status;
			if (status === 401 || status === 403) {
				this.logger.warn(`VnSky 401 UnAuthorized. Retrying with new token...`);
				token = await this.handleTokenExpired(true);
				return await apiCall(token);
			}
			throw error;
		}
	}

	private async saveTokenToCache(data: VnSkyLoginResResult) {
		const accessTtl = data.expiresIn > 60 ? data.expiresIn - 60 : 3500;
		await this.redis.setEx(
			VNSKY_KEYS.ACCESS_TOKEN,
			data.accessToken,
			accessTtl,
		);

		if (data.refreshToken) {
			await this.redis.setEx(
				VNSKY_KEYS.REFRESH_TOKEN,
				data.refreshToken,
				604800,
			);
		}
		this.logger.log(
			`Tokens cached successfully. AccessToken TTl: ${accessTtl}s`,
		);
	}

	private async getValidToken(): Promise<string> {
		const cacheAccessToken = await this.redis.get(VNSKY_KEYS.ACCESS_TOKEN);
		if (cacheAccessToken) return cacheAccessToken;

		return this.handleTokenExpired();
	}

	private async handleTokenExpired(forceLogin = false): Promise<string> {
		const lockKey = VNSKY_KEYS.AUTH_LOCK;
		const isLocked = await this.redis.set(lockKey, 'LOCKED', 10);

		if (isLocked !== 'OK') {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			const newToken = await this.redis.get(VNSKY_KEYS.ACCESS_TOKEN);
			return newToken || this.getValidToken();
		}

		try {
			if (!forceLogin) {
				const refreshToken = await this.redis.get(VNSKY_KEYS.REFRESH_TOKEN);
				if (refreshToken) {
					try {
						this.logger.log('Attempting to refresh VnSky token...');
						const res = await this.vnSkyRefreshToken(refreshToken);
						await this.saveTokenToCache(res);
						return res.accessToken;
					} catch (e) {
						this.logger.error('Refresh token failed, falling back to login...');
					}
				}
			}

			this.logger.log('Login to VnSky...');
			const loginRes = await this.vnSkyLogin();
			await this.saveTokenToCache(loginRes);

			return loginRes.accessToken;
		} finally {
			await this.redis.del(lockKey);
		}
	}

	private getVnSkyAuthHeader() {
		return {
			authorization: `Basic ${this.settings.VNSKY_AUTHENTICATION_BASIC_CODE}`,
		};
	}

	private getVnSkyHeader(accessToken: string) {
		return {
			authorization: `Bearer ${accessToken}`,
		};
	}
}
