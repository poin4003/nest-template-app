import { BaseController } from '@/core/base/base.controller';
import { ActionLogService } from '@/modules/action-logs/service/action-log.service';
import { ActionLogQuery } from '@/modules/action-logs/service/schemas/action-log.query';
import { Controller, Get, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ActionLogResDto } from '../dto/action-log-res.dto';

@Controller('api/v1/action-log')
export class ActionLogController extends BaseController {
	constructor(private readonly actionLogService: ActionLogService) {
		super();
	}

	@Get('/')
	async listActionLogs(@Query() query: ActionLogQuery) {
		const { items, total } =
			await this.actionLogService.getManyActionLog(query);

		const data = {
			items: plainToInstance(ActionLogResDto, items),
			pagination: {
				currentPage: query.currentPage,
				pageSize: query.pageSize,
				total: total,
			},
		};

		return this.OK(data, 'Fetch action logs');
	}

	@Get('/all')
	async listAllActionLogs(@Query() query: ActionLogQuery) {
		const items = await this.actionLogService.getAllActionLog(query);

		const data = {
			items: plainToInstance(ActionLogResDto, items),
		};

		return this.OK(
			data,
			'Fetch all action logs',
		);
	}
}
