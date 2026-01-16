import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ResultCode } from '../response/result-code';
import { MyException } from '../exception/my.exception';
import { ResultUtil } from '../response/result-util';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionFilter.name);

	private readonly statusMap: Record<number, ResultCode> = {
		[HttpStatus.NOT_FOUND]: ResultCode.RESOURCE_NOT_FOUND,
		[HttpStatus.BAD_REQUEST]: ResultCode.PARAMS_ERROR,
		[HttpStatus.UNAUTHORIZED]: ResultCode.USER_AUTH_ERROR,
		[HttpStatus.FORBIDDEN]: ResultCode.USER_PERMISSION_ERROR,
		[HttpStatus.TOO_MANY_REQUESTS]: ResultCode.RATE_LIMIT_ERROR,
		[HttpStatus.SERVICE_UNAVAILABLE]: ResultCode.ERROR,
	};

	private mergeMessage(
		resultCode: ResultCode,
		dynamicDetail: string | null,
	): string {
		const baseMessage = resultCode.message;
		if (!dynamicDetail || dynamicDetail.trim() === '') {
			return baseMessage;
		}
		const hasPunctuation = ['.', '!', '?'].some((char) =>
			baseMessage.endsWith(char),
		);
		const separator = hasPunctuation ? ' ' : '. ';
		return `${baseMessage}${separator}${dynamicDetail}`;
	}

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		let resultCode: ResultCode = ResultCode.ERROR;
		let finalMessage: string = 'Internal Server Error';
		let httpStatus: number = HttpStatus.INTERNAL_SERVER_ERROR;

		if (exception instanceof MyException) {
			resultCode = exception.resultCode;
			httpStatus = exception.httpStatusCode;
			finalMessage = this.mergeMessage(resultCode, exception.myMessage);
		} else if (exception instanceof HttpException) {
			httpStatus = exception.getStatus();
			const res: any = exception.getResponse();

			resultCode = this.statusMap[httpStatus] || ResultCode.ERROR;

			const detail =
				typeof res === 'string'
					? res
					: Array.isArray(res.message)
						? res.message.join('; ')
						: res.message;

			finalMessage = this.mergeMessage(resultCode, detail);
		} else {
			this.logger.error('Unhandled Exception:', (exception as Error).stack);
		}

		response
			.status(httpStatus)
			.json(ResultUtil.error(resultCode, finalMessage));
	}
}
