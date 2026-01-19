import { OrderStepEnum } from '../../order.enum';

export class OrderStepFailedEvent {
	constructor(
		public readonly orderId: string,
		public readonly step: OrderStepEnum,
		public readonly errorMessage: string,
		public readonly errorCode: number,
	) {}
}
