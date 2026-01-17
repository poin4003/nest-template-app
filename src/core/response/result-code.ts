import { HttpStatus } from '@nestjs/common';
import { ErrorCategoryEnum } from '../enums/error-category.enum';
import { Http } from 'winston/lib/winston/transports';

export class ResultCode {
	static readonly SUCCESS = new ResultCode(
		0,
		'Success',
		HttpStatus.OK,
		ErrorCategoryEnum.BUSINESS,
	);
	static readonly CREATED = new ResultCode(
		1,
		'Created',
		HttpStatus.OK,
		ErrorCategoryEnum.BUSINESS,
	);
	static readonly NO_CONTENT = new ResultCode(
		2,
		'No content',
		HttpStatus.NO_CONTENT,
		ErrorCategoryEnum.BUSINESS,
	);

	static readonly RATE_LIMIT_ERROR = new ResultCode(
		1000,
		'Server has reached its limit, please try again later.',
		HttpStatus.TOO_MANY_REQUESTS,
		ErrorCategoryEnum.INFRASTRUCTURE,
	);

	static readonly USER_SESSION_EXPIRED = new ResultCode(
		2000,
		'Login session is expired, please re-login',
		HttpStatus.UNAUTHORIZED,
		ErrorCategoryEnum.SECURITY,
	);
	static readonly USER_PERMISSION_ERROR = new ResultCode(
		2001,
		'PERMISSION DENIED',
		HttpStatus.FORBIDDEN,
		ErrorCategoryEnum.SECURITY,
	);
	static readonly USER_AUTH_ERROR = new ResultCode(
		2002,
		'Authentication Failed',
		HttpStatus.UNAUTHORIZED,
		ErrorCategoryEnum.SECURITY,
	);

	static readonly RESOURCE_NOT_FOUND = new ResultCode(
		4000,
		'Resource not found',
		HttpStatus.BAD_REQUEST,
		ErrorCategoryEnum.BUSINESS,
	);
	static readonly PARAMS_ERROR = new ResultCode(
		4001,
		'Invalid param',
		HttpStatus.BAD_REQUEST,
		ErrorCategoryEnum.VALIDATION,
	);
	static readonly RESOURCE_ALREADY_EXIST = new ResultCode(
		4002,
		'Resource already exists',
		HttpStatus.BAD_REQUEST,
		ErrorCategoryEnum.BUSINESS,
	);

	static readonly ERROR = new ResultCode(
		5000,
		'Error server occured',
		HttpStatus.INTERNAL_SERVER_ERROR,
		ErrorCategoryEnum.UNKNOWN,
	);

  static readonly VN_SKY_LOGIN_ERROR = new ResultCode(
    6000,
    'VnSky login failed',
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCategoryEnum.THIRD_PARTY,
  )

  static readonly VN_SKY_REFRESH_TOKEN_ERROR = new ResultCode(
    6001,
    'VnSky refresh token failed',
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCategoryEnum.THIRD_PARTY,
  )

  static readonly VN_SKY_PROFILE_ERROR = new ResultCode(
    6002,
    'VnSky profile failed',
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCategoryEnum.THIRD_PARTY,
  )

	private constructor(
		public readonly code: number,
		public readonly message: string,
		public readonly httpStatus: HttpStatus,
		public readonly category: ErrorCategoryEnum,
	) {}
}
