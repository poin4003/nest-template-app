import { IsString } from "class-validator"

export class VnSkyCheckSimQuery {
  @IsString()
  serial: string

  @IsString()
  isdn: string
}

export class VnSkyOcrQuery {
  @IsString()
  cardType: string
}
