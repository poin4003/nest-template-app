import type { UUID } from "@/common/types";

export class ActionLogResDto {
	id: UUID;
	payload: string | null;
	objectId: string | null;
	response: string | null;
	reqAt: Date | null;
	reqDuration: number | null;
	status: number;
	type: number;
	createdAt: Date;
	updatedAt: Date;
	description: string;
	note: string;
}
