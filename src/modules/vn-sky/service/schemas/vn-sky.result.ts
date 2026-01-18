import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class VnSkyLoginResResult {
	@Expose({ name: 'access_token' })
	@IsString()
	accessToken: string;

	@Expose({ name: 'refresh_token' })
	@IsString()
	refreshToken: string;

	@Expose({ name: 'token_type' })
	@IsString()
	tokenType: string;

	@Expose({ name: 'expires_in' })
	@IsNumber()
	expiresIn: number;
}

export class VnSkyClient {
	@IsString()
	code: string;

	@IsString()
	name: string;

	@IsString()
	contactPhone: string;
}

export class VnSkyRole {
	@IsString()
	code: string;

	@IsString()
	name: string;
}

export class VnSkyProfileResult {
	@IsString()
	id: string;

	@IsString()
	username: string;

	@IsString()
	fullname: string;

	@IsString()
	email: string;

	@IsString()
	phoneNumber: string;

	client: VnSkyClient;

	roles: [VnSkyRole];
}

export class VnSkyCheckSimResult {
	@IsString()
	isdn: string;

	@IsNumber()
	serial: number;

	@IsNumber()
	kitStatus: number;

	@IsString()
	pckCode: string;

	@IsString()
	pckName: string;

	@IsString()
	registerDate: string;

	@IsString()
	clientId: string;

	@IsString()
	orgName: string;
}

export class VnSkyOrcResult {
	@IsString()
	address?: string;

	@IsString()
	birthday?: string;

	@IsString()
	c06SuccessMessage?: string;

	@Expose({ name: 'c06_errors' })
	@IsString()
	c06Errors?: string;

	@IsString()
	name?: string;

	@IsString()
	id?: string;

	@Expose({ name: 'id_ekyc' })
	@IsString()
	idEkyc?: string;

	@Expose({ name: 'issue_by' })
	@IsString()
	issueBy?: string;

	@Expose({ name: 'issue_date' })
	@IsString()
	issueDate?: string;

	@IsString()
	expiry?: string;

	@IsString()
	sex?: string;

	@IsString()
	document?: string = '1';
}

export class VnSkyCheckProfileResult {
	@IsString()
	c06SuccessMessage: string;
}
