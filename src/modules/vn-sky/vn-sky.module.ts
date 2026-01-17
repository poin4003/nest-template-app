import { Module } from '@nestjs/common';
import { VnSkyService } from './service/vn-sky.service';
import { CommonModule } from '../common/common.module';
import { AppConfigModule } from '@/config/settings/app-config.module';
import { VnSkyController as VnSkyControllerV1 } from './api/v1/controller/vn-sky.controller';

@Module({
	imports: [CommonModule, AppConfigModule],
  controllers: [VnSkyControllerV1],
	providers: [VnSkyService],
	exports: [VnSkyService],
})
export class VnSkyModule {}
