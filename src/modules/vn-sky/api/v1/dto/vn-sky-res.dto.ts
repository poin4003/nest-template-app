import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VnSkyLoginReqDto {
  @ApiProperty({ example: 'password', description: 'grant_type' })
	@IsString()
	grant_type: string = 'password';

  @ApiProperty({ example: 'client_id' })
	@IsString()
	client_identity: string = 'ECOTE';

  @ApiProperty({ example: 'user_01' })
	@IsString()
	username: string;

  @ApiProperty({ example: '123456' })
	@IsString()
	password: string;
}
