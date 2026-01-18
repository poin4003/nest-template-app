import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { OrderStatusEnum, OrderStepEnum, OrderTypeEnum } from '../order.enum';
import { ProfileResult } from '@/modules/profile/service/schemas/profile.result';

export class OrderResult {
	@IsUUID()
	orderId: string;

	@IsString()
	code: string;

	@IsString()
	phoneNumber: string;

	@IsString()
	serial: string;

	@IsString()
	@IsOptional()
	otp?: string;

	step: OrderStepEnum;
	status: OrderStatusEnum;
	type: OrderTypeEnum;

	@IsNumber()
	errorCode: number;

	@IsString()
	errorMessage: string;

  profile: ProfileResult

	createdAt: Date;
	updatedAt: Date;
	description?: string;
	note?: string;
}
