import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateActionLogCommand {
	@IsOptional()
	@IsString()
	payload?: string;

	@IsOptional()
	@IsString()
	objectId?: string;

	@IsOptional()
	@IsString()
	response?: string;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	reqAt?: Date;

  @IsOptional()
  @IsNumber()
  reqDuration?: number;

	@IsOptional()
	@IsNumber()
	status?: number;

	@IsOptional()
	@IsNumber()
	type?: number;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	note?: string;
}
