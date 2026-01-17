import { BaseController } from '@/core/base/base.controller';
import { VnSkyService } from '@/modules/vn-sky/service/vn-sky.service';
import { Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

@Controller('api/v1/vn-sky')
export class VnSkyController extends BaseController {
	constructor(private readonly vnSkyService: VnSkyService) {
		super();
	}

	@Post('/profile')
	@ApiOperation({ summary: 'VnSky Profile' })
	async vnSkyLogin() {
		const data = await this.vnSkyService.vnSkyProfile();

		return this.OK(data, 'Login vnsky success');
	}
}
