export class VnSkyOrderDataRaw {
  customerCode: string;
	otp: string;
	sessionToken: string;
	publicKey: string;
	expiredAt: string;
  contractNo: string;

  constructor(partial: Partial<VnSkyOrderDataRaw>) {
		Object.assign(this, partial);
	}
}
