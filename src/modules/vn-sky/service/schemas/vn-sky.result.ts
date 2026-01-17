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

  roles: [VnSkyRole]
}
