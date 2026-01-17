import { BaseController } from '@/core/base/base.controller';
import { VnSkyService } from '@/modules/vn-sky/service/vn-sky.service';
import {
	Body,
	Controller,
	Post,
	Query,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import {
	VnSkyCheckSimQueryDto,
	VnSkyOcrQueryDto,
	VnSkyOcrReqDto,
} from '../dto/vn-sky-res.dto';
import {
	VnSkyCheckSimQuery,
	VnSkyOcrQuery,
} from '@/modules/vn-sky/service/schemas/vn-sky.query';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { VnSkyKit, VnSkyOcrReqCommand } from '@/modules/vn-sky/service/schemas/vn-sky.command';

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

	@Post('/check-sim')
	@ApiOperation({ summary: 'VnSky check sim' })
	async vnSkyCheckSim(@Query() query: VnSkyCheckSimQueryDto) {
		const queryInput = new VnSkyCheckSimQuery();
		queryInput.serial = query.serial;
		queryInput.isdn = query.isdn;

		const data = await this.vnSkyService.vnSkyCheckSim(queryInput);

		return this.OK(data, 'Check vnsky sim success');
	}

	@Post('/ocr')
  @ApiConsumes('multipart/form-data')
	@ApiOperation({ summary: 'VnSky ocr' })
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: 'cardFront', maxCount: 1 },
			{ name: 'cardBack', maxCount: 1 },
			{ name: 'portrait', maxCount: 1 },
		]),
	)
	async vnSkyOrc(
		@Query() queryInput: VnSkyOcrQueryDto,
		@Body() dto: VnSkyOcrReqDto,
		@UploadedFiles()
		files: {
			cardFront: Express.Multer.File[];
			cardBack: Express.Multer.File[];
			portrait: Express.Multer.File[];
		},
	) {
		const query = new VnSkyOcrQuery();
		const cmd = new VnSkyOcrReqCommand();
		query.cardType = queryInput.cardType;
		cmd.cardFront = files.cardFront[0];
		cmd.cardBack = files.cardBack[0];
		cmd.portrait = files.portrait[0];
		cmd.enableActiveMore3 = dto.enableActiveMore3;
    cmd.data = new VnSkyKit();
		cmd.data.isdn = dto.isdn;
		cmd.data.serial = dto.serial;

		const result = await this.vnSkyService.vnSkyOrc(query, cmd);

		return this.OK(result, 'VnSky orc success');
	}
}
