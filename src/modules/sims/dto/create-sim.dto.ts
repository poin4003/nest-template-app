import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateSimDto {
	@IsString()
	@IsNotEmpty({ message: 'Serial number must not empty' })
	serialNumber: string;

	@IsString()
	@Length(10, 11, { message: 'Phone number must in 10-11 char' })
	phoneNumber: string;
}
