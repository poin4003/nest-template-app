import { IsString } from "class-validator";

export class OrderRegCommand {
  cardFront: Express.Multer.File;
  cardBack: Express.Multer.File;
  portrait: Express.Multer.File;

  @IsString()
  phoneNumber: string;

  @IsString()
  serial: string;
}

export class StartOrderCommand {
  constructor(public readonly cmd: OrderRegCommand) {}
}

export class CheckSimBeforeRegCommand {
  constructor(public readonly orderId: string) {}
}

export class ProcessOcrCommand {
  constructor(public readonly orderId: string) {}
}
