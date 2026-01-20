import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { performance } from 'perf_hooks';
import { ActionLogService } from '@/modules/action-logs/service/action-log.service';
import {
	BaseApiRequestCommand,
	FormDataApiRequest,
	JsonApiRequest,
	UrlEncodedApiRequest,
} from './schemas/common.command';
import { ActionLogStatusEnum } from '@/modules/action-logs/action-log.enum';
import { HTTPMethod } from '@/core/enums/http-method.enum';
import { MyLoggerService } from '@/common/logger/my-logger.service';

@Injectable()
export class CommonService {
	constructor(
		private readonly httpService: HttpService,
		private readonly actionLogService: ActionLogService,
		private readonly logger: MyLoggerService,
	) {}

	async callApi<T>(cmd: JsonApiRequest<T>): Promise<T> {
		const plainPayload = instanceToPlain(cmd.payload);

		const payloadLogStr = JSON.stringify(plainPayload);

		const headers = {
			'Content-Type': 'application/json',
			...cmd.headers,
		};

		return this.executeRequest<T>(cmd, plainPayload, payloadLogStr, headers);
	}

	async callFormDataApi<T>(cmd: FormDataApiRequest<T>): Promise<T> {
		const form = new FormData();
		const logPayload: any = { ...cmd.payload };

		for (const key in cmd.payload) {
			form.append(key, cmd.payload[key]);
		}

		if (cmd.files) {
			for (const key in cmd.files) {
				const file = cmd.files[key];
				form.append(key, file.buffer || file, file.originalname || key);
				logPayload[key] = `<File: ${file.originalname || 'binary'}>`;
			}
		}

		const payloadLogStr = JSON.stringify(logPayload);
		const headers = { ...cmd.headers, ...form.getHeaders() };

		return this.executeRequest<T>(cmd, form, payloadLogStr, headers);
	}

	async callUrlEncodedApi<T>(cmd: UrlEncodedApiRequest<T>): Promise<T> {
		const plainPayload = instanceToPlain(cmd.payload);

		const params = new URLSearchParams();

		if (plainPayload) {
			for (const key in plainPayload) {
				const value = plainPayload[key];

				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			}
		}

		const payloadLogStr = params.toString();

		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			...cmd.headers,
		};

		return this.executeRequest<T>(cmd, params, payloadLogStr, headers);
	}

	async callMixedFormDataApi<T>(cmd: FormDataApiRequest<T>): Promise<T> {
		const form = new FormData();
		const logPayload: any = { ...cmd.payload };

		for (const key in cmd.payload) {
			const value = cmd.payload[key];

			const stringValue =
				typeof value === 'object' ? JSON.stringify(value) : String(value);

			form.append(key, stringValue, {
				contentType: 'application/json',
			});
		}

		if (cmd.files) {
			for (const key in cmd.files) {
				const file = cmd.files[key];
				if (file && file.buffer) {
					form.append(key, file.buffer, {
						filename: file.originalname || `${key}.jpg`,
						contentType: file.mimetype || 'image/jpeg',
					});
					logPayload[key] = `<File: ${file.originalname}>`;
				}
			}
		}

		const payloadLogStr = JSON.stringify(logPayload);

		const finalHeaders = {
			...form.getHeaders(),
			...cmd.headers,
		};

		return this.executeRequest<T>(
			cmd,
			form.getBuffer(),
			payloadLogStr,
			finalHeaders,
		);
	}

	private async executeRequest<T>(
		cmd: BaseApiRequestCommand<T>,
		body: any,
		payloadLogStr: string,
		headers: any,
	): Promise<T> {
		const startAt = performance.now();
		const reqAt = new Date();
		let responseData: any = null;
		let status = ActionLogStatusEnum.SUCCESS;
		let errorMsg = '';

		let finalUrl = cmd.url;

		if (cmd.pathParams) {
			Object.entries(cmd.pathParams).forEach(([key, value]) => {
				finalUrl = finalUrl.replace(`:${key}`, String(value));
			});
		}

		if (cmd.queryParams && Object.keys(cmd.queryParams).length > 0) {
			const queryStr = new URLSearchParams(cmd.queryParams).toString();
			finalUrl = finalUrl.includes('?')
				? `${finalUrl}&${queryStr}`
				: `${finalUrl}?${queryStr}`;
		}

		try {
			const response = await firstValueFrom(
				this.httpService.request({
					method: cmd.method || HTTPMethod.POST,
					url: finalUrl,
					data: body,
					headers: headers,
				}),
			);

			responseData = response.data;

			return cmd.responseModel && responseData
				? plainToInstance(cmd.responseModel, responseData)
				: (responseData as T);
		} catch (error) {
			status = ActionLogStatusEnum.FAILURE;
			responseData = error.response?.data;
			errorMsg = responseData?.message || error.message;
			throw new InternalServerErrorException(errorMsg);
		} finally {
			const duration = (performance.now() - startAt) / 1000;

			const rawLogData =
				status === ActionLogStatusEnum.FAILURE ? responseData : responseData;

			const sanitizedResponse = this.sanitizeLogData(rawLogData, 200);

			const finalResponseLog =
				status === ActionLogStatusEnum.FAILURE
					? JSON.stringify(sanitizedResponse || errorMsg)
					: JSON.stringify(sanitizedResponse);

			this.actionLogService
				.createActionLog({
					payload: payloadLogStr,
					objectId: '',
					response: finalResponseLog,
					reqAt: reqAt,
					reqDuration: duration,
					status: status,
					type: cmd.logType,
				})
				.catch((err) => {
					this.logger.error('Write ActionLog Failed:', err);
				});
		}
	}

	private sanitizeLogData(data: any, maxLength = 500): any {
		if (!data) return data;

		if (typeof data === 'string') {
			if (data.length > maxLength) {
				return `${data.substring(0, maxLength)} ...[TRUNCATED ${data.length - maxLength} chars]`;
			}
			return data;
		}

		if (Array.isArray(data)) {
			if (data.length > 20) {
				const preview = data
					.slice(0, 20)
					.map((item) => this.sanitizeLogData(item, maxLength));
				preview.push(`...[HIDDEN ${data.length - 20} ITEMS]`);
				return preview;
			}
			return data.map((item) => this.sanitizeLogData(item, maxLength));
		}

		if (typeof data === 'object') {
			const newData: any = {};
			for (const key in data) {
				if (Object.prototype.hasOwnProperty.call(data, key)) {
					newData[key] = this.sanitizeLogData(data[key], maxLength);
				}
			}
			return newData;
		}

		return data;
	}
}
