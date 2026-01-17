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

@Injectable()
export class CommonService {
	constructor(
		private readonly httpService: HttpService,
		private readonly actionLogService: ActionLogService,
	) {}

	async callApi<T>(cmd: JsonApiRequest<T>): Promise<T> {
		const payloadLogStr = JSON.stringify(cmd.payload);
		return this.executeRequest<T>(cmd, cmd.payload, payloadLogStr, cmd.headers);
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
      ...cmd.headers
    };

    return this.executeRequest<T>(cmd, params, payloadLogStr, headers);
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

		try {
			const response = await firstValueFrom(
				this.httpService.request({
					method: cmd.method || HTTPMethod.POST,
					url: cmd.url,
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

			this.actionLogService
				.createActionLog({
					payload: payloadLogStr,
					objectId: '',
					response:
						status === ActionLogStatusEnum.FAILURE
							? errorMsg
							: JSON.stringify(responseData),
					reqAt: reqAt,
					reqDuration: duration,
					status: status,
					type: cmd.logType,
				})
				.catch(() => {});
		}
	}
}
