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
}
