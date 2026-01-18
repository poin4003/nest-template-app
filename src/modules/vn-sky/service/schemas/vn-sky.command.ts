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
