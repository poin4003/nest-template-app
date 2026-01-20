export class VnSkyOrderDataRaw {
  customerCode: string;

  id: string; // For otp confirm
	transactionId: string; // For otp confirm 

	sessionToken: string;
	publicKey: string;
	expiredAt: string;

  contractNo: string;

  contractId: string;
  contractPNGImagePath: string;
  type: number;

	pckCode: string;
	pckName: string;

  constructor(partial: Partial<VnSkyOrderDataRaw>) {
		Object.assign(this, partial);
	}
}
