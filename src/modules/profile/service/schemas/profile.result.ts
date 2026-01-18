import { ProfileStatusEnum, ProfileTypeEnum } from "../../profile.enum";

export class ProfileResult {
	id: string;

  orderId: string;

  rawData?: string;

	name?: string;

	frontPath?: string;

	backPath?: string;

	portrait?: string;

	status: ProfileStatusEnum;

  type: ProfileTypeEnum;
}
