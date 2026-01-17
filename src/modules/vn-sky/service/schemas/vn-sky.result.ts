import { IsString } from 'class-validator';

export class VnSkyLoginResResult {
	@IsString()
	access_token: string;

	@IsString()
	refresh_token: string;

	@IsString()
	token_type: string;

	@IsString()
	expires_in: number;
}
