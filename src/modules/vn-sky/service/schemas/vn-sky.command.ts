import { IsString } from 'class-validator';

export class VnSkyLoginReqCommand {
	@IsString()
	grant_type: string = 'password';

	@IsString()
	client_identity: string = 'ECOTE';

	@IsString()
	username: string;

	@IsString()
	password: string;
}
