import { CommonService } from '@/modules/common/service/common.service';
import { Injectable } from '@nestjs/common';
import { VnSkyLoginReqCommand } from './schemas/vn-sky.command';
import { UrlEncodedApiRequest } from '@/modules/common/service/schemas/common.command';
import { AppConfigService } from '@/config/settings/app-config.service';
import { ActionLogTypeEnum } from '@/modules/action-logs/action-log.enum';
import { VnSkyLoginResResult } from './schemas/vn-sky.result';

@Injectable()
export class VnSkyService {
	constructor(
		private readonly commonService: CommonService,
		private readonly settings: AppConfigService,
	) {}

	async vnSkyLogin(cmd: VnSkyLoginReqCommand) {
		return this.commonService.callUrlEncodedApi(
			new UrlEncodedApiRequest({
				url: `${this.settings.VNSKY_BASE_URL}/admin-service/public/oauth2/token`,
				logType: ActionLogTypeEnum.VNSKY_LOGIN,
				payload: cmd,
				responseModel: VnSkyLoginResResult,
			}),
		);
	}
}
