import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ActionLogModule } from '../action-logs/action-log.module';
import { CommonService } from './service/common.service';

@Module({
	imports: [
		HttpModule.register({
			timeout: 0,
			maxRedirects: 5,
		}),
		ActionLogModule,
	],
	providers: [CommonService],
	exports: [CommonService, CommonModule],
})
export class CommonModule {}
