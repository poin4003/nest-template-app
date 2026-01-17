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
  refreshToken: string
}