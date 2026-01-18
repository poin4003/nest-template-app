import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class VnSkyLoginReqCommand {
	@Expose({ name: 'grant_type' })
	@IsString()
	grantType: string = 'password';

	@Expose({ name: 'client_identity' })
	@IsString()
	clientIdentity: string = 'ECOTE';

	@IsString()
	username: string;

	@IsString()
	password: string;
}

export class VnSkyRefreshTokenReqCommand {
	@Expose({ name: 'grant_type' })
	@IsString()
	grantType: string = 'password';

	@Expose({ name: 'refresh_token' })
	@IsString()
	refreshToken: string;
}

export class VnSkyKit {
	@IsString()
	isdn: string;

	@IsString()
	serial: string;
}

export class VnSkyOcrReqCommand {
	cardFront: Express.Multer.File;
	cardBack: Express.Multer.File;
	portrait: Express.Multer.File;

	@IsString()
	enableActiveMore3: string = '0';

	@IsString()
	data: VnSkyKit;
}

export class VnSkyCheckProfileCommand {
	@IsString()
	address: string;

	@IsString()
	birthday: string;

	@IsString()
	city: string;

	@IsString()
	district: string;

	@IsString()
	ward: string;

	@IsString()
	document: string;

	@IsString()
	expiry: string;

	@IsString()
	id: string;

	@Expose({ name: 'id_ekyc' })
	@IsString()
	idEkyc: string;

	@Expose({ name: 'issue_by' })
	@IsString()
	issueBy: string;

	@Expose({ name: 'issue_date' })
	@IsString()
	issueDate: string;

	@IsString()
	name: string;

	@IsString()
	sex: string;
}

export class VnSkyPhoneObject {
  @IsString()
  phoneNumber: string;

  @IsString()
  serialSim: string;

  @IsString()
  packagePlan: string;
}

export class VnSkyGenContractCommand {
  codeDecree13: [string];

  @IsString()
  contractNo: string;

  @IsString()
  customerId: string;

  @IsString()
  ccdvvt: string;

  @IsString()
  contractDate: string;

  @IsString()
  customerName: string;

  @IsString()
  gender: string;

  @IsString()
  birthDate: string;

  @IsString()
  idNo: string;

  @IsString()
  idDate: string;

  @IsString()
  idPlace: string;

  @IsString()
  address: string;

  @IsString()
  type: string;

  phoneLists: [VnSkyPhoneObject];

  @IsString()
  deviceToken: string;
}
