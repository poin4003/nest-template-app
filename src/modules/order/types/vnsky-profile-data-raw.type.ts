import { VnSkyPhoneObject } from '@/modules/vn-sky/service/schemas/vn-sky.command';

export class VnSkyProfileDataRaw {
	idNo: string;
	address: string;
	birthday: string;
	name: string;
	idEkyc: string;
	issueBy: string;
	issueDate: string;
	sex: string;
	document: string;
	nationality: string;
	city: string;
	district: string;
	ward: string;
	listPhoneNumber: VnSkyPhoneObject[];
	totalSim: number;
	checkSendOtp: boolean;

	constructor(partial: Partial<VnSkyProfileDataRaw>) {
		Object.assign(this, partial);
	}
}
