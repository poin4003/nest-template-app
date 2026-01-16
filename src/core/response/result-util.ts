import { ResultMessage } from '../vo/result-message';
import { ResultCode } from './result-code';

export class ResultUtil {
	static create<T>(
		resultCode: ResultCode,
		myMessage: string | null,
		data: T | null,
	): ResultMessage<T> {
		const response = new ResultMessage<T>();

		response.code = resultCode.code;

		response.message =
			myMessage && myMessage.trim() !== '' ? myMessage : resultCode.message;

		response.data = data;

		return response;
	}

	static success<T>(data: T): ResultMessage<T> {
		return this.create(ResultCode.SUCCESS, null, data);
	}

	static error(
		resultCode: ResultCode,
		myMessage?: string,
	): ResultMessage<null> {
		return this.create(resultCode, myMessage || null, null);
	}
}
