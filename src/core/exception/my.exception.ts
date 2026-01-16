import { ResultCode } from '../response/result-code';

export class MyException extends Error {
	public readonly resultCode: ResultCode;
	public readonly httpStatusCode: number;
	public readonly myMessage: string;

	constructor(resultCode: ResultCode, httpStatusCode: number, myMessage: string) {
		super(resultCode.message);

		Object.setPrototypeOf(this, MyException.prototype);

		this.resultCode = resultCode;
		this.httpStatusCode = httpStatusCode;
		this.myMessage = myMessage;
		this.name = MyException.name;
	}
}
