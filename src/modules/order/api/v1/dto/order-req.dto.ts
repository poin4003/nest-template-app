import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class OrderRegDto {
	@ApiProperty({ type: 'string', format: 'binary' })
  cardFront: Express.Multer.File;

	@ApiProperty({ type: 'string', format: 'binary' })
  cardBack: Express.Multer.File;

	@ApiProperty({ type: 'string', format: 'binary' })
  portrait: Express.Multer.File;

	@ApiProperty()
  @IsString()
  phoneNumber: string;

	@ApiProperty()
  @IsString()
  serial: string;
}
