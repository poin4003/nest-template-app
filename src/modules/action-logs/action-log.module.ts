import { Module } from '@nestjs/common';
import { ActionLogService } from './service/action-log.service';
import { ActionLogRepository } from './repository/action-log.repository';
import { ActionLogController as ActionLogControllerV1 } from './api/v1/controller/action-log.controller';

@Module({
	providers: [ActionLogService, ActionLogRepository],
	controllers: [ActionLogControllerV1],
  exports: [ActionLogService]
})
export class ActionLogModule {}
