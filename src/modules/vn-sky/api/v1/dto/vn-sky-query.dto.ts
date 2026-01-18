import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VnSkyCheckSimQueryDto {
	@ApiProperty()
	@IsString()
	serial: string;

	@ApiProperty()
	@IsString()
	isdn: string;
}

export class VnSkyOcrQueryDto {
	@ApiProperty()
	@IsString()
	cardType: string;
}

export class VnSkyGenContractNumberQueryDto {
	@ApiProperty()
	@IsString()
	idNo: string;

	@ApiProperty()
	@IsString()
	activeType: string;
}

export class VnSkyGenCustomerCodeQueryDto {
	@ApiProperty()
	@IsString()
	idNo: string;
}

export class VnSkyGenSecretKeyQueryDto {
	@ApiProperty()
	@IsString()
	idKyc: string;
}
