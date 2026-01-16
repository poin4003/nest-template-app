export class ResultMessage<T> {
	code: number;
	message: string;
	timestamp: number;
	data: T | null;

	constructor() {
		this.code = 0;
		this.message = '';
		this.timestamp = Date.now();
		this.data = null;
	}
}
