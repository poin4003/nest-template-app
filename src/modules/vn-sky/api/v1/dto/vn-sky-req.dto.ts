import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VnSkyLoginReqDto {
	@ApiProperty({ example: 'password' })
	@IsString()
	grantType: string = 'password';

	@ApiProperty()
	@IsString()
	clientIdentity: string = 'ECOTE';

	@ApiProperty()
	@IsString()
	username: string;

	@ApiProperty()
	@IsString()
	password: string;
}

export class VnSkyRefreshTokenReqDto {
	@ApiProperty()
	@IsString()
	grantType: string = 're';

	@ApiProperty()
	@IsString()
	refreshToken: string;
}

export class VnSkyOcrReqDto {
	@ApiProperty({ type: 'string', format: 'binary' })
	cardFront: any;

	@ApiProperty({ type: 'string', format: 'binary' })
	cardBack: any;

	@ApiProperty({ type: 'string', format: 'binary' })
	portrait: any;

	@ApiProperty({ example: '0' })
	@IsString()
	enableActiveMore3: string;

	@ApiProperty()
	@IsString()
	isdn: string;

	@ApiProperty()
	@IsString()
	serial: string;
}

export class VnSkyCheckProfileReqDto {
	@ApiProperty()
	@IsString()
	address: string;

	@ApiProperty()
	@IsString()
	birthday: string;

	@ApiProperty()
	@IsString()
	city: string;

	@ApiProperty()
	@IsString()
	district: string;

	@ApiProperty()
	@IsString()
	ward: string;

	@ApiProperty()
	@IsString()
	document: string;

	@ApiProperty()
	@IsString()
	expiry: string;

	@ApiProperty()
	@IsString()
	id: string;

	@ApiProperty()
	@IsString()
	idEkyc: string;

	@ApiProperty()
	@IsString()
	issueBy: string;

	@ApiProperty()
	@IsString()
	issueDate: string;

	@ApiProperty()
	@IsString()
	name: string;

	@ApiProperty()
	@IsString()
	sex: string;
}

export class VnSkyPhoneObjectDto {
	@ApiProperty()
	@IsString()
	phoneNumber: string;

	@ApiProperty()
	@IsString()
	serialSim: string;

	@ApiProperty()
	@IsString()
	packagePlan: string;
}

export class VnSkyGenContractDto {
	@ApiProperty()
	codeDecree13: [string];

	@ApiProperty()
	@IsString()
	contractNo: string;

	@ApiProperty()
	@IsString()
	customerId: string;

	@ApiProperty()
	@IsString()
	ccdvvt: string;

	@ApiProperty()
	@IsString()
	contractDate: string;

	@ApiProperty()
	@IsString()
	customerName: string;

	@ApiProperty()
	@IsString()
	gender: string;

	@ApiProperty()
	@IsString()
	birthDate: string;

	@ApiProperty()
	@IsString()
	idNo: string;

	@ApiProperty()
	@IsString()
	idDate: string;

	@ApiProperty()
	@IsString()
	idPlace: string;

	@ApiProperty()
	@IsString()
	address: string;

	@ApiProperty()
	@IsString()
	type: string;

	@ApiProperty({
		type: [VnSkyPhoneObjectDto],
	})
	phoneLists: [VnSkyPhoneObjectDto];

	@ApiProperty()
	@IsString()
	deviceToken: string;
}

export class VnSkyGetOtpReqDto {
	@ApiProperty()
  @IsString()
  isdn: string;

	@ApiProperty()
  @IsString()
  idEkyc: string;
}

export class VnSkyConfirmOtpReqDto {
	@ApiProperty()
	@IsString()
	id: string;

	@ApiProperty()
	@IsString()
	idEkyc: string;

	@ApiProperty()
	@IsString()
	isdn: string;

	@ApiProperty()
	@IsString()
	transactionId: string;

	@ApiProperty()
	@IsString()
	otp: string;

	@ApiProperty()
	@IsString()
	idNo: string;
}
