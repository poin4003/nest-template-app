import { ResultCode } from '../response/result-code';
import { ResultUtil } from '../response/result-util';
import { ResultMessage } from '../vo/result-message';

export abstract class BaseController {
	private createResponse<T>(
		resultCode: ResultCode,
		myMessage: string | null,
		data: T | null,
	): ResultMessage<T> {
		return ResultUtil.create(resultCode, myMessage, data);
	}

	protected OK<T>(data: T, myMessage?: string): ResultMessage<T> {
		return this.createResponse(ResultCode.SUCCESS, myMessage || null, data);
	}

	protected Created<T>(data: T, myMessage?: string): ResultMessage<T> {
		return this.createResponse(ResultCode.CREATED, myMessage || null, data);
	}

	protected NoContent<T>(myMessage?: string): ResultMessage<null> {
		return this.createResponse(ResultCode.NO_CONTENT, myMessage || null, null);
	}
}
