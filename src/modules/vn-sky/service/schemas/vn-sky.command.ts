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
  refreshToken: string
}
