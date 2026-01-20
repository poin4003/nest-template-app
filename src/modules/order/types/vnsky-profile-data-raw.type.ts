export class VnSkyProfileDataRaw {
	idNo: string;
	address: string;
	birthday: string;
	name: string;
	idEkyc: string;
	issueBy: string;
	issueDate: string;
  expiry: string;
	sex: string;
	document: string;
	nationality: string;
	city: string;
	district: string;
	ward: string;
	listPhoneNumber: string[];
	totalSim: number;
	checkSendOtp: boolean;

	constructor(partial: Partial<VnSkyProfileDataRaw>) {
		Object.assign(this, partial);
	}
}
