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
	VnSkyCheckProfileReqDto,
	VnSkyConfirmOtpReqDto,
	VnSkyGenContractDto,
	VnSkyGetOtpReqDto,
	VnSkyOcrReqDto,
} from '../dto/vn-sky-req.dto';
import {
	VnSkyCheckSimQuery,
	VnSkyGenContractNumberQuery,
	VnSkyGenCustomerCodeQuery,
	VnSkyGenSecretKeyQuery,
	VnSkyOcrQuery,
} from '@/modules/vn-sky/service/schemas/vn-sky.query';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
	VnSkyCheckProfileCommand,
	VnSkyConfirmOtpCommand,
	VnSkyGenContractCommand,
	VnSkyGetOtpCommand,
	VnSkyKit,
	VnSkyOcrReqCommand,
} from '@/modules/vn-sky/service/schemas/vn-sky.command';
import { VnSkyCheckSimQueryDto, VnSkyGenContractNumberQueryDto, VnSkyGenCustomerCodeQueryDto, VnSkyGenSecretKeyQueryDto, VnSkyOcrQueryDto } from '../dto/vn-sky-query.dto';

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

		const result = await this.vnSkyService.vnSkyOcr(query, cmd);

		return this.OK(result, 'VnSky orc success');
	}

	@Post('/gen-customer-code')
	@ApiOperation({ summary: 'VnSky generate customer code' })
	async vnSkyGenCustomerCode(@Query() query: VnSkyGenCustomerCodeQueryDto) {
		const queryInput = new VnSkyGenCustomerCodeQuery();
		queryInput.idNo = query.idNo;

		const data = await this.vnSkyService.vnSkyGenCustomerCode(queryInput);

		return this.OK(data, 'Vnsky generate customer code success');
	}

	@Post('/gen-secret-key')
	@ApiOperation({ summary: 'VnSky generate secret key' })
	async vnSkyGenSecretKey(@Query() query: VnSkyGenSecretKeyQueryDto) {
		const queryInput = new VnSkyGenSecretKeyQuery();
		queryInput.idKyc = query.idKyc;

		const data = await this.vnSkyService.vnSkyGenSecretKey(queryInput);

		return this.OK(data, 'Vnsky generate customer code success');
	}

	@Post('/check-profile')
	@ApiOperation({ summary: 'VnSky check profile' })
	async vnSkyCheckProfile(@Body() dto: VnSkyCheckProfileReqDto) {
		const cmd = new VnSkyCheckProfileCommand();
		cmd.address = dto.address;
		cmd.birthday = dto.birthday;
		cmd.city = dto.city;
		cmd.district = dto.district;
		cmd.ward = dto.ward;
		cmd.document = dto.document;
		cmd.expiry = dto.expiry;
		cmd.id = dto.id;
		cmd.idEkyc = dto.idEkyc;
		cmd.issueBy = dto.issueBy;
		cmd.issueDate = dto.issueDate;
		cmd.name = dto.name;
		cmd.sex = dto.sex;

		const data = await this.vnSkyService.vnSkyCheckProfile(cmd);

		return this.OK(data, 'Vnsky check profile success');
	}

	@Post('/gen-contract-number')
	@ApiOperation({ summary: 'VnSky generate contract number' })
	async vnSkyGenContractNumber(@Query() query: VnSkyGenContractNumberQueryDto) {
		const queryInput = new VnSkyGenContractNumberQuery();
		queryInput.idNo = query.idNo;
		queryInput.activeType = query.activeType;

		const data = await this.vnSkyService.vnSkyGenContractNumber(queryInput);

		return this.OK(data, 'Vnsky generate contract type success');
	}

	@Post('/gen-contract')
	@ApiOperation({ summary: 'VnSky gen contract' })
	async vnSkyGenContract(@Body() dto: VnSkyGenContractDto) {
		const cmd = new VnSkyGenContractCommand();
    cmd.codeDecree13 = dto.codeDecree13;
    cmd.contractNo = dto.contractNo;
    cmd.customerId = dto.customerId;
    cmd.ccdvvt = dto.ccdvvt;
    cmd.contractDate = dto.contractDate;
    cmd.customerName = dto.customerName;
    cmd.gender = dto.gender;
    cmd.birthDate = dto.birthDate;
    cmd.idNo = dto.idNo;
    cmd.idDate = dto.idDate;
    cmd.idPlace = dto.idPlace;
    cmd.address = dto.address;
    cmd.type = dto.type;
    cmd.phoneLists = dto.phoneLists;
    cmd.deviceToken = dto.deviceToken;

		const data = await this.vnSkyService.vnSkyGenContract(cmd);

		return this.OK(data, 'Vnsky check profile success');
	}

	@Post('/get-otp')
	@ApiOperation({ summary: 'VnSky get otp' })
	async vnSkyGetOtp(@Body() dto: VnSkyGetOtpReqDto) {
    const cmd = new VnSkyGetOtpCommand();
    cmd.idEkyc = dto.idEkyc;
    cmd.isdn = dto.isdn;

		const data = await this.vnSkyService.vnSkyGetOtp(cmd);

		return this.OK(data, 'Vnsky get otp success');
	}

	@Post('/confirm-otp')
	@ApiOperation({ summary: 'VnSky confirm otp' })
	async vnSkyConfirmOtp(@Body() dto: VnSkyConfirmOtpReqDto) {
    const cmd = new VnSkyConfirmOtpCommand();
    cmd.id = dto.id;
    cmd.idEkyc = dto.idEkyc;
    cmd.isdn = dto.isdn;
    cmd.transactionId = dto.transactionId;
    cmd.otp = dto.otp;
    cmd.idNo = dto.idNo;

		const data = await this.vnSkyService.vnSkyConfirmOtp(cmd);

		return this.OK(data, 'Vnsky confirm otp success');
	}
}
