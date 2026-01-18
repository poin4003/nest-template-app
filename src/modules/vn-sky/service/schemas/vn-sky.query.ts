import { IsString } from 'class-validator';

export class VnSkyCheckSimQuery {
	@IsString()
	serial: string;

	@IsString()
	isdn: string;
}

export class VnSkyOcrQuery {
	@IsString()
	cardType: string;
}

export class VnSkyGenCustomerCodeQuery {
	@IsString()
	idNo: string;
}

export class VnSkyGenSecretKeyQuery {
	@IsString()
	idKyc: string;
}

export class VnSkyGenContractNumberQuery {
  @IsString()
  idNo: string;

  @IsString()
  activeType: string;
}
