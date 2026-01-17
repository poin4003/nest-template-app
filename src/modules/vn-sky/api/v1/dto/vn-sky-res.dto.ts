import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VnSkyLoginReqDto {
	@ApiProperty({ example: 'password' })
	@IsString()
	grantType: string = 'password';

	@ApiProperty({ example: 'client_id' })
	@IsString()
	clientIdentity: string = 'ECOTE';

	@ApiProperty({ example: 'user01' })
	@IsString()
	username: string;

	@ApiProperty({ example: '123456' })
	@IsString()
	password: string;
}

export class VnSkyRefreshTokenReqDto {
	@ApiProperty({ example: 'refresh_token' })
	@IsString()
	grantType: string = 're';

	@ApiProperty({ example: 'refresh_token' })
	@IsString()
	refreshToken: string;
}

export class VnSkyCheckSimQueryDto {
	@ApiProperty({ example: 'serial' })
	@IsString()
	serial: string;

	@ApiProperty({ example: 'isdn' })
	@IsString()
	isdn: string;
}

export class VnSkyOcrQueryDto {
	@ApiProperty({ example: 'cardType' })
  @IsString()
  cardType: string
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

	@ApiProperty({ example: 'serial' })
	@IsString()
	isdn: string;

	@ApiProperty({ example: 'isdn' })
	@IsString()
	serial: string;
}
