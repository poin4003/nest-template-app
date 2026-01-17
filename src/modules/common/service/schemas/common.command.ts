import { HTTPMethod } from '@/core/enums/http-method.enum';
import { ActionLogTypeEnum } from '@/modules/action-logs/action-log.enum';

export class BaseApiRequestCommand<T> {
	url: string;
	method?: HTTPMethod;
	logType: ActionLogTypeEnum;
	headers?: Record<string, string>;
	responseModel?: { new (...args: any[]): T };

	constructor(init?: Partial<BaseApiRequestCommand<T>>) {
		Object.assign(this, init);
	}
}

export class JsonApiRequest<T> extends BaseApiRequestCommand<T> {
	payload: any;
	constructor(init?: Partial<JsonApiRequest<T>>) {
		super(init);
		this.payload = init?.payload || {};
	}
}

export class FormDataApiRequest<T> extends BaseApiRequestCommand<T> {
	payload: Record<string, any>;
	files?: Record<string, any>;
	constructor(init?: Partial<FormDataApiRequest<T>>) {
		super(init);
		this.payload = init?.payload || {};
		this.files = init?.files;
	}
}

export class UrlEncodedApiRequest<T> extends BaseApiRequestCommand<T> {
	payload: Record<string, any>;

	constructor(init?: Partial<UrlEncodedApiRequest<T>>) {
		super(init);
		this.payload = init?.payload || {};
	}
}
