import { ResultCode } from '../response/result-code';
import { MyException } from './my.exception';

export class ExceptionFactory {
	private static create(code: ResultCode, messageDetail: string): MyException {
		return new MyException(code, code.httpStatus, messageDetail);
	}

	static dataNotFound(detail: string) {
		return this.create(ResultCode.RESOURCE_NOT_FOUND, detail);
	}

	static dataAlreadyExists(detail: string) {
		return this.create(ResultCode.RESOURCE_ALREADY_EXIST, detail);
	}

	static serverError(detail: string) {
		return this.create(ResultCode.ERROR, detail);
	}

	static validationError(detail: string) {
		return this.create(ResultCode.PARAMS_ERROR, detail);
	}

	static permissionError(detail: string) {
		return this.create(ResultCode.USER_PERMISSION_ERROR, detail);
	}

	static tooManyRequest(detail: string) {
		return this.create(ResultCode.RATE_LIMIT_ERROR, detail);
	}

	static sessionExpired(detail: string) {
		return this.create(ResultCode.USER_SESSION_EXPIRED, detail);
	}

	static invalidTokenError(detail: string) {
		return this.create(ResultCode.USER_AUTH_ERROR, detail);
	}

	static vnSkyLoginError(detail: string) {
		return this.create(ResultCode.VN_SKY_LOGIN_ERROR, detail);
	}

	static vnSkyRefreshTokenError(detail: string) {
		return this.create(ResultCode.VN_SKY_REFRESH_TOKEN_ERROR, detail);
	}

	static vnSkyProfileError(detail: string) {
		return this.create(ResultCode.VN_SKY_PROFILE_ERROR, detail);
	}

	static vnSkyCheckSimError(detail: string) {
		return this.create(ResultCode.VN_SKY_CHECK_SIM_ERROR, detail);
	}

	static vnSkyOcrError(detail: string) {
		return this.create(ResultCode.VN_SKY_OCR_ERROR, detail);
	}

	static vnSkyGenCustomerCodeError(detail: string) {
		return this.create(ResultCode.VN_SKY_GEN_CUSTOMER_CODE_ERROR, detail);
	}

	static vnSkyGenSecretKeyError(detail: string) {
		return this.create(ResultCode.VN_SKY_GEN_SECRET_KEY_ERROR, detail);
	}

	static vnSkyCheckProfileError(detail: string) {
		return this.create(ResultCode.VN_SKY_CHECK_PROFILE_ERROR, detail);
	}

	static vnSkyGenContractNumberError(detail: string) {
		return this.create(ResultCode.VN_SKY_GEN_CONTRACT_NUMBER, detail);
	}

	static vnSkyGenContractError(detail: string) {
		return this.create(ResultCode.VN_SKY_GEN_CONTRACT, detail);
	}

	static vnSkyGetOtpError(detail: string) {
		return this.create(ResultCode.VN_SKY_GET_OTP, detail);
	}

	static vnSkyConfirmOtpError(detail: string) {
		return this.create(ResultCode.VN_SKY_CONFIRM_OTP, detail);
	}
}
