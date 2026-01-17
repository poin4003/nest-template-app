import { BaseController } from '@/core/base/base.controller';
import { VnSkyService } from '@/modules/vn-sky/service/vn-sky.service';
import { Body, Controller, Post } from '@nestjs/common';
import { VnSkyLoginReqDto } from '../dto/vn-sky-res.dto';
import { VnSkyLoginReqCommand } from '@/modules/vn-sky/service/schemas/vn-sky.command';
import { plainToInstance } from 'class-transformer';
import { ApiOperation } from '@nestjs/swagger';

@Controller('api/v1/vn-sky')
export class VnSkyController extends BaseController {
	constructor(private readonly vnSkyService: VnSkyService) {
		super();
	}

	@Post('/login')
  @ApiOperation({ summary: 'Login VnSky' })
	async vnSkyLogin(@Body() dto: VnSkyLoginReqDto) {
		const data = await this.vnSkyService.vnSkyLogin(
			plainToInstance(VnSkyLoginReqCommand, dto),
		);

		return this.OK(data, 'Login vnsky success');
	}
}
